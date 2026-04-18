/**
 * 12지신(地支) 간 역학적 상성 관계 매트릭스
 * PDF 가이드라인 3.1절 "12지신과 일진의 상성 모델링" 기반
 */

// 지지 인덱스: 0=자(쥐), 1=축(소), 2=인(호랑이), 3=묘(토끼), 4=진(용), 5=사(뱀),
//              6=오(말), 7=미(양), 8=신(원숭이), 9=유(닭), 10=술(개), 11=해(돼지)

export type RelationType = 'samhap' | 'yukhap' | 'sangchung' | 'wonjin' | 'hyung' | 'pa' | 'bihwa' | 'neutral';

export interface RelationResult {
  type: RelationType;
  nameKo: string;
  scoreModifier: number; // 퍼센트 보정치
  toneKeywords: string[];
  description: string;
}

/**
 * 육합(六合) 관계: 1:1 결합으로 조화와 화합
 * 자-축, 인-해, 묘-술, 진-유, 사-신, 오-미
 */
const YUKHAP_PAIRS: [number, number][] = [
  [0, 1],   // 자-축
  [2, 11],  // 인-해
  [3, 10],  // 묘-술
  [4, 9],   // 진-유
  [5, 8],   // 사-신
  [6, 7],   // 오-미
];

/**
 * 삼합(三合) 관계: 세 지지가 만나 강한 오행 세력 형성
 * 인오술(화국), 해묘미(목국), 신자진(수국), 사유축(금국)
 */
const SAMHAP_GROUPS: number[][] = [
  [2, 6, 10],   // 인오술 → 화국
  [11, 3, 7],   // 해묘미 → 목국
  [8, 0, 4],    // 신자진 → 수국
  [5, 9, 1],    // 사유축 → 금국
];

/**
 * 상충(相沖) 관계: 서로 마주보는 지지의 충돌
 * 자-오, 축-미, 인-신, 묘-유, 진-술, 사-해
 */
const SANGCHUNG_PAIRS: [number, number][] = [
  [0, 6],   // 자-오
  [1, 7],   // 축-미
  [2, 8],   // 인-신
  [3, 9],   // 묘-유
  [4, 10],  // 진-술
  [5, 11],  // 사-해
];

/**
 * 원진(怨嗔) 관계: 불화, 오해, 감정적 소모
 * 자-미, 축-오, 인-사, 묘-진, 신-해, 유-술
 */
const WONJIN_PAIRS: [number, number][] = [
  [0, 7],   // 자-미
  [1, 6],   // 축-오
  [2, 5],   // 인-사
  [3, 4],   // 묘-진
  [8, 11],  // 신-해
  [9, 10],  // 유-술
];

/**
 * 형(刑) 관계: 형벌, 조정, 기존 상태의 깨어짐
 * 인-사-신(삼형살), 축-술-미(삼형살), 자-묘(무례지형), 진-진/오-오/유-유/해-해(자형)
 */
const HYUNG_PAIRS: [number, number][] = [
  [2, 5],   // 인-사
  [5, 8],   // 사-신
  [2, 8],   // 인-신
  [1, 10],  // 축-술
  [10, 7],  // 술-미
  [1, 7],   // 축-미
  [0, 3],   // 자-묘
];

// 자형(自刑): 같은 지지끼리
const SELF_HYUNG = [4, 6, 9, 11]; // 진, 오, 유, 해

/**
 * 파(破) 관계: 깨뜨림
 * 자-유, 축-진, 인-해, 묘-오, 사-신, 미-술
 */
const PA_PAIRS: [number, number][] = [
  [0, 9],   // 자-유
  [1, 4],   // 축-진
  [2, 11],  // 인-해
  [3, 6],   // 묘-오
  [5, 8],   // 사-신
  [7, 10],  // 미-술
];

function isPairMatch(pairs: [number, number][], a: number, b: number): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function isSamhap(a: number, b: number): boolean {
  return SAMHAP_GROUPS.some(group => group.includes(a) && group.includes(b));
}

/**
 * 사용자의 띠 지지 인덱스와 오늘 일진의 지지 인덱스를 받아
 * 역학적 상성 관계를 판별하고 점수 보정치를 반환합니다.
 *
 * @param zodiacBranchIndex 사용자 띠의 지지 인덱스 (0~11)
 * @param dayBranchIndex    오늘 일진의 지지 인덱스 (0~11)
 */
export function analyzeRelation(zodiacBranchIndex: number, dayBranchIndex: number): RelationResult {
  // 우선순위: 육합 > 삼합 > 상충 > 원진 > 형 > 파 > 비화 > 중립

  if (isPairMatch(YUKHAP_PAIRS, zodiacBranchIndex, dayBranchIndex)) {
    return {
      type: 'yukhap',
      nameKo: '육합',
      scoreModifier: 20,
      toneKeywords: ['조화', '귀인', '협력', '순조로움', '계약 성사'],
      description: '조화로운 기운이 강하게 형성되어 대인관계와 협력에 유리한 흐름입니다.',
    };
  }

  if (isSamhap(zodiacBranchIndex, dayBranchIndex)) {
    return {
      type: 'samhap',
      nameKo: '삼합',
      scoreModifier: 20,
      toneKeywords: ['강한 결합', '시너지', '목표 달성', '팀워크'],
      description: '강한 세력이 모여 시너지를 발휘하는 날입니다. 큰 목표에 도전해 보세요.',
    };
  }

  if (isPairMatch(SANGCHUNG_PAIRS, zodiacBranchIndex, dayBranchIndex)) {
    return {
      type: 'sangchung',
      nameKo: '상충',
      scoreModifier: -15,
      toneKeywords: ['변화', '이동', '충돌 주의', '금전 지출 유의', '기회로 전환'],
      description: '충돌과 변화의 기운이 있습니다. 급격한 결정보다 변화를 기회로 전환하는 지혜가 필요합니다.',
    };
  }

  if (isPairMatch(WONJIN_PAIRS, zodiacBranchIndex, dayBranchIndex)) {
    return {
      type: 'wonjin',
      nameKo: '원진',
      scoreModifier: -10,
      toneKeywords: ['감정 조절', '오해 주의', '양보', '신경전 자제'],
      description: '감정적 소모가 생기기 쉬운 날입니다. 대화에서 한 발 물러서는 여유가 도움이 됩니다.',
    };
  }

  if (isPairMatch(HYUNG_PAIRS, zodiacBranchIndex, dayBranchIndex) ||
      (zodiacBranchIndex === dayBranchIndex && SELF_HYUNG.includes(zodiacBranchIndex))) {
    return {
      type: 'hyung',
      nameKo: '형',
      scoreModifier: -10,
      toneKeywords: ['문서 주의', '확장 자제', '꼼꼼한 확인', '신중한 서명'],
      description: '조정과 점검이 필요한 날입니다. 무리한 확장보다 기존 업무를 꼼꼼히 챙기세요.',
    };
  }

  if (isPairMatch(PA_PAIRS, zodiacBranchIndex, dayBranchIndex)) {
    return {
      type: 'pa',
      nameKo: '파',
      scoreModifier: -10,
      toneKeywords: ['기존 상태 변동', '예상치 못한 변화', '유연한 대응'],
      description: '기존의 흐름에 변동이 생길 수 있습니다. 유연한 대응이 핵심입니다.',
    };
  }

  if (zodiacBranchIndex === dayBranchIndex) {
    return {
      type: 'bihwa',
      nameKo: '비화',
      scoreModifier: 0,
      toneKeywords: ['경쟁', '동료애', '주체성 강화', '동업 고려'],
      description: '같은 기운이 만나 경쟁과 동료애가 공존하는 날입니다. 주체성을 가지고 나아가세요.',
    };
  }

  return {
    type: 'neutral',
    nameKo: '중립',
    scoreModifier: 0,
    toneKeywords: ['평온', '무난', '자기 페이스', '안정'],
    description: '특별한 충돌이나 결합 없이 평온한 기운의 날입니다. 자기 페이스대로 나아가세요.',
  };
}
