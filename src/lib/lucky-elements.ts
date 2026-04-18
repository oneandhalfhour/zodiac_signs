/**
 * 오행(五行) 기반 행운 요소 산출 로직
 * PDF 가이드라인 3.2절 "행운의 요소(색상, 숫자, 방향) 산출 로직" 기반
 *
 * 일진의 천간이 가진 오행을 분석하고, 이를 보완(용신)하는 오행의
 * 색상, 숫자, 방향을 반환합니다.
 */

export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface LuckyElements {
  element: Element;
  elementNameKo: string;
  colors: string[];
  numbers: number[];
  direction: string;
}

// 천간 인덱스(0~9) → 오행 매핑
// 갑(0)=목, 을(1)=목, 병(2)=화, 정(3)=화, 무(4)=토, 기(5)=토, 경(6)=금, 신(7)=금, 임(8)=수, 계(9)=수
const CHEONGAN_TO_ELEMENT: Element[] = [
  'wood', 'wood',   // 갑, 을
  'fire', 'fire',   // 병, 정
  'earth', 'earth', // 무, 기
  'metal', 'metal', // 경, 신
  'water', 'water', // 임, 계
];

// 오행 상생(相生) 순환: 목→화→토→금→수→목
// 오행 상극(相剋): 목→토, 토→수, 수→화, 화→금, 금→목
// 용신(보완 오행) = 일진 오행을 생(生)해주는 오행
const ELEMENT_PARENT: Record<Element, Element> = {
  wood: 'water',   // 수생목: 물이 나무를 길러줌
  fire: 'wood',    // 목생화: 나무가 불을 키워줌
  earth: 'fire',   // 화생토: 불이 흙을 만들어줌
  metal: 'earth',  // 토생금: 흙이 금속을 품어줌
  water: 'metal',  // 금생수: 금속이 물을 맺어줌
};

// 오행별 행운 요소 매핑 (PDF 3.2절 테이블)
const ELEMENT_LUCKY_MAP: Record<Element, LuckyElements> = {
  wood: {
    element: 'wood',
    elementNameKo: '목(木)',
    colors: ['청색', '녹색'],
    numbers: [3, 8],
    direction: '동쪽',
  },
  fire: {
    element: 'fire',
    elementNameKo: '화(火)',
    colors: ['적색', '분홍색'],
    numbers: [2, 7],
    direction: '남쪽',
  },
  earth: {
    element: 'earth',
    elementNameKo: '토(土)',
    colors: ['황색', '베이지색'],
    numbers: [5, 10],
    direction: '중앙',
  },
  metal: {
    element: 'metal',
    elementNameKo: '금(金)',
    colors: ['흰색', '은색'],
    numbers: [4, 9],
    direction: '서쪽',
  },
  water: {
    element: 'water',
    elementNameKo: '수(水)',
    colors: ['검은색', '네이비'],
    numbers: [1, 6],
    direction: '북쪽',
  },
};

/**
 * 일진의 천간 인덱스(0~9)를 받아서
 * 오행 분석 기반의 행운 요소(색상, 숫자, 방향)를 반환합니다.
 *
 * 로직: 일진 천간의 오행 → 그 오행을 생(生)해주는 용신 오행 → 용신 오행의 색상/숫자/방향 반환
 */
export function calculateLuckyElements(dayCheonganIndex: number): LuckyElements {
  const dayElement = CHEONGAN_TO_ELEMENT[dayCheonganIndex];
  const yongsinElement = ELEMENT_PARENT[dayElement]; // 보완해주는 오행
  return ELEMENT_LUCKY_MAP[yongsinElement];
}

/**
 * 일진 천간 인덱스로부터 해당 오행의 한국어 이름을 반환합니다.
 */
export function getDayElementName(dayCheonganIndex: number): string {
  const element = CHEONGAN_TO_ELEMENT[dayCheonganIndex];
  return ELEMENT_LUCKY_MAP[element].elementNameKo;
}
