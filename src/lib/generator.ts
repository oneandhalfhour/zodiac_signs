/**
 * 콘텐츠 생성 파이프라인 (PDF 가이드라인 5장 "4단계 콘텐츠 생성 파이프라인")
 *
 * 1단계: 달력 컨텍스트 추출 (lunar-calendar.ts)
 * 2단계: 상성 점수 산출 + 행운 요소 계산 (zodiac-relations.ts, lucky-elements.ts)
 * 3단계: 프롬프트 체이닝 및 템플릿 인젝션 (prompts.ts)
 * 4단계: LLM 추론 및 JSON 구조화 파싱
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { PrismaClient } from '@prisma/client';
import { getCalendarInfo, getSolarTerm } from './lunar-calendar';
import { analyzeRelation } from './zodiac-relations';
import { calculateLuckyElements } from './lucky-elements';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  getWeekdayKo,
  getBranchHanja,
  FortunePromptContext,
} from './prompts';

const prisma = new PrismaClient();

// 띠(zodiacId) → 지지 인덱스 매핑
const ZODIAC_TO_BRANCH_INDEX: Record<string, number> = {
  rat: 0, ox: 1, tiger: 2, rabbit: 3, dragon: 4, snake: 5,
  horse: 6, sheep: 7, monkey: 8, rooster: 9, dog: 10, pig: 11,
};

interface GeneratedFortune {
  overall: string;
  career_wealth: string;
  love_connection: string;
  health: string;
}

const LLM_MODEL = 'claude-haiku-4-5-20251001';

/**
 * 4단계: Claude 구독 계정으로 호출 및 JSON 파싱 (PDF 5.4절 "LLM 추론 및 JSON 구조화 파싱")
 * ANTHROPIC_API_KEY 없이 `claude` CLI 로그인 세션을 사용합니다.
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<GeneratedFortune> {
  let text = '';

  for await (const message of query({
    prompt: userPrompt,
    options: {
      systemPrompt,
      allowedTools: [],
      model: LLM_MODEL,
    },
  })) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          text = block.text;
        }
      }
    }
  }

  if (!text) throw new Error('LLM이 텍스트를 반환하지 않았습니다');

  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error(`LLM이 유효한 JSON을 반환하지 않았습니다: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[1]);
}

/**
 * 금지어 필터링 (PDF 8.3절 "콘텐츠 안전 가드레일")
 */
const FORBIDDEN_WORDS = ['파산', '사망', '질병', '재앙', '교통사고', '이혼', '암', '파멸', '자살'];

function sanitizeText(text: string): string {
  let sanitized = text;
  for (const word of FORBIDDEN_WORDS) {
    sanitized = sanitized.replace(new RegExp(word, 'g'), '주의');
  }
  return sanitized;
}

/**
 * 글자 수 제한 검증 (PDF 5.4절 "후처리 로직")
 */
function truncateToLimit(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 특정 날짜의 특정 띠에 대한 운세를 전체 파이프라인으로 생성합니다.
 */
export async function generateFortuneForZodiac(dateStr: string, zodiacId: string) {
  // ===== 1단계: 달력 컨텍스트 추출 =====
  const calInfo = getCalendarInfo(dateStr);
  const solarTerm = getSolarTerm(calInfo.solarMonth, calInfo.solarDay);

  // ===== 2단계: 상성 점수 산출 + 행운 요소 =====
  const zodiacBranchIndex = ZODIAC_TO_BRANCH_INDEX[zodiacId];
  const relation = analyzeRelation(zodiacBranchIndex, calInfo.dayGanjiIndex);
  const luckyElements = calculateLuckyElements(calInfo.dayCheonganIndex);

  // 기본 점수(75) + 상성 보정
  const baseScore = 75;
  const totalScore = Math.max(50, Math.min(99,
    Math.round(baseScore + (baseScore * relation.scoreModifier / 100))
  ));

  // ===== 3단계: 프롬프트 조립 =====
  const zodiacInfo = await prisma.zodiacSign.findUnique({ where: { zodiacId } });
  if (!zodiacInfo) throw new Error(`Invalid zodiacId: ${zodiacId}`);

  // DB에서 해당 날짜의 공휴일 정보를 조회 (seed-calendar.ts로 사전 적재된 데이터)
  const calendarRow = await prisma.calendarDate.findUnique({ where: { solarDate: dateStr } });
  const holidayContext = calendarRow?.holidayName ?? '';

  const promptCtx: FortunePromptContext = {
    zodiacDisplayName: zodiacInfo.displayNameKo,
    zodiacHanja: getBranchHanja(zodiacBranchIndex),
    dateStr: `${calInfo.solarYear}년 ${calInfo.solarMonth}월 ${calInfo.solarDay}일`,
    weekdayKo: getWeekdayKo(calInfo.weekday),
    ganjiDay: calInfo.ganjiDay,
    solarTerm,
    holidayContext,
    relation,
    totalScore,
    luckyElements,
  };

  const userPrompt = buildUserPrompt(promptCtx);

  // ===== 4단계: LLM 호출 + 후처리 =====
  const raw = await callLLM(SYSTEM_PROMPT, userPrompt);

  const fortune = {
    overall: truncateToLimit(sanitizeText(raw.overall), 200),
    career_wealth: truncateToLimit(sanitizeText(raw.career_wealth), 150),
    love_connection: truncateToLimit(sanitizeText(raw.love_connection), 150),
    health: truncateToLimit(sanitizeText(raw.health), 100),
  };

  // GenerationLog 기록 (PDF 4.3절 — 프롬프트 엔지니어링 개선용)
  await prisma.generationLog.create({
    data: {
      serviceDate: dateStr,
      zodiacId,
      promptPayload: JSON.stringify({ system: SYSTEM_PROMPT, user: userPrompt }),
      llmRawResponse: JSON.stringify(raw),
      modelUsed: LLM_MODEL,
    },
  });

  return {
    serviceDate: dateStr,
    zodiacId,
    overallScore: totalScore,
    overallText: fortune.overall,
    moneyText: fortune.career_wealth,
    careerText: fortune.career_wealth,
    loveText: fortune.love_connection,
    healthText: fortune.health,
    luckyColor: luckyElements.colors[0],
    luckyNumber: luckyElements.numbers[0],
    luckyDirection: luckyElements.direction,
    toneType: relation.nameKo,
    ganjiDay: calInfo.ganjiDay,
  };
}

/**
 * 특정 날짜의 12띠 전체 운세를 일괄 생성하고 DB에 저장합니다.
 */
export async function generateAllFortunesForDate(dateStr: string) {
  const calInfo = getCalendarInfo(dateStr);

  // calendar_dates 행 UPSERT — 신규인 경우 기본값으로 생성 (seed-calendar.ts가 정확한 데이터를 적재함)
  const solarTerm = getSolarTerm(calInfo.solarMonth, calInfo.solarDay);
  const lunarDateStr = `${calInfo.lunarYear}-${String(calInfo.lunarMonth).padStart(2, '0')}-${String(calInfo.lunarDay).padStart(2, '0')}`;
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
      lunarDateStr,
      ganjiDay: calInfo.ganjiDay.replace('일', ''),
      ganjiYear: calInfo.ganjiYear.replace('년', ''),
      isPublicHoliday: false,
      solarTerm,
    },
  });

  const zodiacs = await prisma.zodiacSign.findMany({ where: { isActive: true }, orderBy: { orderNo: 'asc' } });
  const results = [];

  for (const zodiac of zodiacs) {
    console.log(`  생성 중: ${dateStr} / ${zodiac.displayNameKo}...`);
    const data = await generateFortuneForZodiac(dateStr, zodiac.zodiacId);

    const fortune = await prisma.dailyFortune.upsert({
      where: {
        serviceDate_zodiacId: {
          serviceDate: dateStr,
          zodiacId: zodiac.zodiacId,
        },
      },
      update: {
        overallScore: data.overallScore,
        overallText: data.overallText,
        moneyText: data.moneyText,
        careerText: data.careerText,
        loveText: data.loveText,
        healthText: data.healthText,
        luckyColor: data.luckyColor,
        luckyNumber: data.luckyNumber,
        luckyDirection: data.luckyDirection,
        status: 'published',
      },
      create: {
        serviceDate: data.serviceDate,
        zodiacId: data.zodiacId,
        overallScore: data.overallScore,
        overallText: data.overallText,
        moneyText: data.moneyText,
        careerText: data.careerText,
        loveText: data.loveText,
        healthText: data.healthText,
        luckyColor: data.luckyColor,
        luckyNumber: data.luckyNumber,
        luckyDirection: data.luckyDirection,
        status: 'published',
      },
    });

    results.push(fortune);
  }

  console.log(`✅ ${dateStr} — 12띠 운세 생성 완료 (${results.length}건)`);
  return results;
}
