/**
 * CalendarDate 사전 적재 스크립트
 * PDF 가이드라인 4.1절 "calendar_dates에 10년치 이상 사전 적재"
 *
 * 사용법: npx tsx scripts/seed-calendar.ts
 */

import { PrismaClient } from '@prisma/client';
import { getCalendarInfo, getSolarTerm } from '../src/lib/lunar-calendar';
import KoreanLunarCalendar from 'korean-lunar-calendar';

const prisma = new PrismaClient();

// 고정 공휴일 (양력 기준 MM-DD)
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
};

// 음력 기반 공휴일 (음력 월-일 → 이름)
const LUNAR_HOLIDAYS: Array<{ lunarMonth: number; lunarDay: number; name: string; surroundDays?: number }> = [
  { lunarMonth: 1, lunarDay: 1, name: '설날', surroundDays: 1 },   // 설날 + 전날/다음날
  { lunarMonth: 1, lunarDay: 15, name: '대보름' },
  { lunarMonth: 4, lunarDay: 8, name: '석가탄신일' },
  { lunarMonth: 8, lunarDay: 14, name: '추석 연휴' },
  { lunarMonth: 8, lunarDay: 15, name: '추석', surroundDays: 1 },  // 추석 + 다음날
];

/**
 * 음력 날짜를 양력으로 변환
 */
function lunarToSolar(year: number, lunarMonth: number, lunarDay: number): string | null {
  try {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(year, lunarMonth, lunarDay, false);
    const solar = cal.getSolarCalendar();
    const m = String(solar.month).padStart(2, '0');
    const d = String(solar.day).padStart(2, '0');
    return `${solar.year}-${m}-${d}`;
  } catch {
    return null;
  }
}

/**
 * 해당 연도의 음력 공휴일을 양력 날짜 Set으로 반환
 */
function buildLunarHolidayMap(year: number): Map<string, string> {
  const map = new Map<string, string>();

  for (const h of LUNAR_HOLIDAYS) {
    const solarDate = lunarToSolar(year, h.lunarMonth, h.lunarDay);
    if (!solarDate) continue;

    map.set(solarDate, h.name);

    if (h.surroundDays) {
      // 연휴 범위 추가 (전날/다음날)
      const base = new Date(solarDate);
      for (let offset = -h.surroundDays; offset <= h.surroundDays; offset++) {
        if (offset === 0) continue;
        const d = new Date(base);
        d.setDate(base.getDate() + offset);
        const key = formatDate(d);
        if (!map.has(key)) {
          map.set(key, `${h.name} 연휴`);
        }
      }
    }
  }

  return map;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function main() {
  const YEARS_AHEAD = 3;
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);  // 올해 1월 1일부터
  const endDate = new Date(today.getFullYear() + YEARS_AHEAD, 11, 31);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  console.log(`🗓  CalendarDate 사전 적재 시작`);
  console.log(`   기간: ${formatDate(startDate)} ~ ${formatDate(endDate)} (약 ${totalDays}일)`);

  // 연도별 음력 공휴일 맵을 미리 계산
  const lunarHolidaysByYear = new Map<number, Map<string, string>>();
  for (let y = today.getFullYear(); y <= today.getFullYear() + YEARS_AHEAD; y++) {
    lunarHolidaysByYear.set(y, buildLunarHolidayMap(y));
  }

  let upserted = 0;
  let skipped = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = formatDate(current);
    const year = current.getFullYear();
    const mmdd = dateStr.slice(5);  // 'MM-DD'

    const calInfo = getCalendarInfo(dateStr);
    const solarTerm = getSolarTerm(calInfo.solarMonth, calInfo.solarDay);

    // 공휴일 판별
    let isPublicHoliday = false;
    let holidayName: string | null = null;

    if (FIXED_HOLIDAYS[mmdd]) {
      isPublicHoliday = true;
      holidayName = FIXED_HOLIDAYS[mmdd];
    } else {
      const lunarMap = lunarHolidaysByYear.get(year);
      if (lunarMap?.has(dateStr)) {
        isPublicHoliday = true;
        holidayName = lunarMap.get(dateStr) ?? null;
      }
    }

    // 음력 날짜 ISO 포맷 (e.g. '2026-03-01')
    const lunarDateStr = `${calInfo.lunarYear}-${String(calInfo.lunarMonth).padStart(2, '0')}-${String(calInfo.lunarDay).padStart(2, '0')}`;

    // 세차(연간지) — 한글 '병오년' → '병오'만 추출
    const ganjiYear = calInfo.ganjiYear.replace('년', '');
    const ganjiDay = calInfo.ganjiDay.replace('일', '');

    try {
      await prisma.calendarDate.upsert({
        where: { solarDate: dateStr },
        update: {
          lunarDateStr,
          ganjiDay,
          ganjiYear,
          isPublicHoliday,
          holidayName,
          solarTerm,
        },
        create: {
          solarDate: dateStr,
          solarYear: calInfo.solarYear,
          solarMonth: calInfo.solarMonth,
          solarDay: calInfo.solarDay,
          weekday: calInfo.weekday,
          lunarMonth: calInfo.lunarMonth,
          lunarDay: calInfo.lunarDay,
          lunarDateStr,
          ganjiDay,
          ganjiYear,
          isPublicHoliday,
          holidayName,
          solarTerm,
        },
      });
      upserted++;
    } catch (err) {
      console.error(`  ❌ ${dateStr} 오류:`, err);
      skipped++;
    }

    if (upserted % 100 === 0 && upserted > 0) {
      console.log(`  ... ${upserted}일 완료`);
    }

    current.setDate(current.getDate() + 1);
  }

  console.log(`\n✅ 완료: ${upserted}일 적재, ${skipped}일 오류`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('seed-calendar 오류:', e);
  process.exit(1);
});
