import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateFortuneForZodiac } from '@/lib/generator';
import { getCalendarInfo, getSolarTerm } from '@/lib/lunar-calendar';

const prisma = new PrismaClient();

// 인메모리 캐시 (PDF 7.2절: 하루 동안 변하지 않는 데이터 캐싱)
const fortuneCache = new Map<string, { data: unknown; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

function getCacheKey(date: string, zodiacId: string): string {
  return `${date}:${zodiacId}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zodiacId = searchParams.get('zodiacId');
  const dateStr = searchParams.get('date');

  if (!zodiacId || !dateStr) {
    return NextResponse.json(
      { error: 'Missing required parameters: zodiacId, date' },
      { status: 400 }
    );
  }

  try {
    // 1차: 인메모리 캐시 확인
    const cacheKey = getCacheKey(dateStr, zodiacId);
    const cached = fortuneCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({ data: cached.data, source: 'cache' });
    }

    // 2차: DB 조회
    let fortune = await prisma.dailyFortune.findUnique({
      where: {
        serviceDate_zodiacId: {
          serviceDate: dateStr,
          zodiacId: zodiacId,
        },
      },
      include: { zodiac: true },
    });

    // 3차: DB에 없으면 실시간 생성 (배치가 아직 돌지 않은 경우 대비)
    if (!fortune) {
      const calInfo = getCalendarInfo(dateStr);

      await prisma.calendarDate.upsert({
        where: { solarDate: dateStr },
        update: {},
        create: {
          solarDate: dateStr,
          solarYear: calInfo.solarYear,
          solarMonth: calInfo.solarMonth,
          solarDay: calInfo.solarDay,
          weekday: calInfo.weekday,
          lunarMonth: calInfo.lunarMonth,
          lunarDay: calInfo.lunarDay,
          isPublicHoliday: false,
          solarTerm: getSolarTerm(calInfo.solarMonth, calInfo.solarDay),
        },
      });

      const data = await generateFortuneForZodiac(dateStr, zodiacId);

      fortune = await prisma.dailyFortune.create({
        data: {
          serviceDate: data.serviceDate,
          zodiacId: data.zodiacId,
          overallScore: data.overallScore,
          overallText: data.overallText,
          moneyText: data.moneyText,
          careerText: data.careerText,
          loveText: data.loveText,
          luckyColor: data.luckyColor,
          luckyNumber: data.luckyNumber,
          luckyDirection: data.luckyDirection,
          status: 'published',
        },
        include: { zodiac: true },
      });
    }

    // 캐시에 저장
    fortuneCache.set(cacheKey, { data: fortune, cachedAt: Date.now() });

    return NextResponse.json({ data: fortune, source: 'db' });
  } catch (error) {
    console.error('Failed to fetch fortune:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
