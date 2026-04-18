export type ZodiacId = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'sheep' | 'monkey' | 'rooster' | 'dog' | 'pig';

export const ZODIAC_ORDER: ZodiacId[] = [
  'monkey',  // 0
  'rooster', // 1
  'dog',     // 2
  'pig',     // 3
  'rat',     // 4
  'ox',      // 5
  'tiger',   // 6
  'rabbit',  // 7
  'dragon',  // 8
  'snake',   // 9
  'horse',   // 10
  'sheep',   // 11
];

/**
 * 주어진 연도(양력 기준)에 해당하는 띠(ZodiacId)를 반환합니다.
 * MVP 버전에서는 양력 연도 기준으로 단순 계산합니다.
 * @param year 태어난 연도 (예: 1992)
 * @returns 띠 ID (예: 'monkey')
 */
export function calculateZodiacByYear(year: number): ZodiacId {
  const index = year % 12;
  return ZODIAC_ORDER[index];
}

/**
 * 생년월일 문자열("YYYY-MM-DD" 또는 "YYYYMMDD")을 받아 띠를 반환합니다.
 * @param birthDate 생년월일
 */
export function getZodiacFromBirthDate(birthDate: string): ZodiacId | null {
  // 숫자만 추출
  const numericString = birthDate.replace(/\D/g, '');
  if (numericString.length < 4) return null;
  
  const year = parseInt(numericString.substring(0, 4), 10);
  if (isNaN(year)) return null;

  return calculateZodiacByYear(year);
}
