/**
 * LLM 프롬프트 엔지니어링 — 시스템/사용자 프롬프트 정의
 * PDF 가이드라인 6.1절 "시스템 프롬프트" 및 6.2절 "사용자 프롬프트" 기반
 */

import { RelationResult } from './zodiac-relations';
import { LuckyElements } from './lucky-elements';

/**
 * 시스템 프롬프트: 페르소나 및 안전 가드레일 확립 (PDF 6.1절)
 */
export const SYSTEM_PROMPT = `당신은 한국 사주명리학과 심리학, 행동 패턴 매핑(Life-pattern mapping)에 통달한 30년 경력의 전문 카운슬러입니다. 당신의 목표는 제공된 띠와 일진(日辰) 데이터를 바탕으로, 사용자에게 마치 오랜 시간 알고 지낸 지인처럼 깊은 통찰과 따뜻하지만 실질적인 일일 운세 리포트를 제공하는 것입니다.

반드시 아래 규칙을 지키세요:
1. 어조는 정중하고 신뢰감을 주는 한국어 경어체(~습니다, ~해 보세요)를 유지하십시오.
2. 명리학의 난해한 한자 용어(예: 식신생재, 관살혼잡 등)는 현대적인 일상 용어로 번역하여 은유적으로 표현하십시오.
3. 절대로 극단적인 흉운, 생명의 위협, 치명적 질병, 파산 등 공포를 조장하는 단어를 사용하지 마십시오.
4. 반드시 제공된 JSON 스키마에 맞춰 응답해야 합니다.
5. 각 섹션의 글자 수 제한을 엄격히 준수하십시오.`;

export interface FortunePromptContext {
  zodiacDisplayName: string;  // e.g. '소띠'
  zodiacHanja: string;        // e.g. '丑'
  dateStr: string;            // e.g. '2026년 4월 18일'
  weekdayKo: string;          // e.g. '토요일'
  ganjiDay: string;           // e.g. '임술일'
  solarTerm: string | null;   // e.g. '곡우' or null
  holidayContext: string;     // e.g. '추석 연휴 전날' or ''
  relation: RelationResult;   // 상성 관계 분석 결과
  totalScore: number;         // 산출된 총점
  luckyElements: LuckyElements; // 행운 요소
}

const WEEKDAY_KO: Record<string, string> = {
  monday: '월요일', tuesday: '화요일', wednesday: '수요일',
  thursday: '목요일', friday: '금요일', saturday: '토요일', sunday: '일요일',
};

export function getWeekdayKo(weekday: string): string {
  return WEEKDAY_KO[weekday] || weekday;
}

// 지지 인덱스 → 한자
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export function getBranchHanja(index: number): string {
  return BRANCH_HANJA[index] || '';
}

/**
 * 사용자 프롬프트 생성 (PDF 6.2절)
 * 동적 변수와 구조적 제약을 주입한 최종 프롬프트를 조립합니다.
 */
export function buildUserPrompt(ctx: FortunePromptContext): string {
  const solarTermLine = ctx.solarTerm
    ? `● 24절기: ${ctx.solarTerm} 부근`
    : '';
  const holidayLine = ctx.holidayContext
    ? `● 시의적 맥락: ${ctx.holidayContext}`
    : '';

  return `[User Context Injection]
아래의 일일 명리학 데이터를 기반으로 운세 리포트를 생성해 주세요.

● 타겟 대상: ${ctx.zodiacDisplayName} (${ctx.zodiacHanja})
● 오늘의 날짜: ${ctx.dateStr} (${ctx.weekdayKo})
● 오늘의 일진: ${ctx.ganjiDay}
${solarTermLine}
${holidayLine}
● 역학적 관계성: ${ctx.relation.nameKo} — ${ctx.relation.description} (운세 점수 ${ctx.totalScore}점)
● 행운 보완 요소: ${ctx.luckyElements.colors[0]} 옷차림, 숫자 ${ctx.luckyElements.numbers[0]}, ${ctx.luckyElements.direction} 방향

[Generation Instructions]
1. 총평(overall): ${ctx.relation.nameKo}의 기운과 ${ctx.weekdayKo}의 시의성을 결합하여 하루의 전체적인 흐름을 200자 이내로 서술하세요. 키워드: ${ctx.relation.toneKeywords.join(', ')}.
2. 직업/재물운(career_wealth): 단순히 돈이 들어온다는 표현 대신, 구체적인 행동 전략(Actionable advice)을 150자 이내로 제시하세요.
3. 연애/대인관계운(love_connection): 감정의 흐름을 분석하고 무의식을 다독일 수 있는 맞춤 코멘트를 150자 이내로 제공하세요.
4. 건강/컨디션(health): 오늘 주의할 신체 부위나 컨디션 관리 팁을 100자 이내로 제공하세요.
5. 출력 형식: 아래의 JSON 구조를 엄격히 준수하세요.

{"overall": "...", "career_wealth": "...", "love_connection": "...", "health": "..."}`.trim();
}
