import KoreanLunarCalendar from 'korean-lunar-calendar';

export interface CalendarInfo {
  solarDate: string;
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  weekday: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLunarLeapMonth: boolean;
  ganjiYear: string;   // e.g. '병오년'
  ganjiMonth: string;  // e.g. '임진월'
  ganjiDay: string;    // e.g. '임술일'
  ganjiYearHanja: string;  // e.g. '丙午年'
  ganjiMonthHanja: string; // e.g. '壬辰月'
  ganjiDayHanja: string;   // e.g. '壬戌日'
  // 60갑자 인덱스 (지지 인덱스가 상성 계산에 사용됨)
  dayGanjiIndex: number;       // 일진의 지지 인덱스 (0~11)
  dayCheonganIndex: number;    // 일진의 천간 인덱스 (0~9)
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * 양력 날짜 문자열(YYYY-MM-DD)로부터 음력, 간지, 요일 등 모든 달력 정보를 추출합니다.
 * korean-lunar-calendar 라이브러리를 사용하여 오프라인에서 즉시 변환합니다.
 */
export function getCalendarInfo(dateStr: string): CalendarInfo {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const cal = new KoreanLunarCalendar();
  cal.setSolarDate(year, month, day);

  const lunar = cal.getLunarCalendar();
  const koreanGapja = cal.getKoreanGapja();
  const chineseGapja = cal.getChineseGapja();
  const gapjaIndex = cal.getGapJaIndex();

  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAYS[dateObj.getDay()];

  return {
    solarDate: dateStr,
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    weekday,
    lunarYear: lunar.year,
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    isLunarLeapMonth: !!lunar.intercalation,
    ganjiYear: koreanGapja.year,
    ganjiMonth: koreanGapja.month,
    ganjiDay: koreanGapja.day,
    ganjiYearHanja: chineseGapja.year,
    ganjiMonthHanja: chineseGapja.month,
    ganjiDayHanja: chineseGapja.day,
    dayGanjiIndex: gapjaIndex.ganji.day,         // 지지 인덱스 (0=자, 1=축 ... 11=해)
    dayCheonganIndex: gapjaIndex.cheongan.day,   // 천간 인덱스 (0=갑, 1=을 ... 9=계)
  };
}

/**
 * 특정 날짜가 24절기에 해당하는지 확인합니다.
 * (간이 버전: 주요 절기의 대략적인 양력 날짜 기반)
 */
const SOLAR_TERMS: { name: string; month: number; dayApprox: number }[] = [
  { name: '소한', month: 1, dayApprox: 6 },
  { name: '대한', month: 1, dayApprox: 20 },
  { name: '입춘', month: 2, dayApprox: 4 },
  { name: '우수', month: 2, dayApprox: 19 },
  { name: '경칩', month: 3, dayApprox: 6 },
  { name: '춘분', month: 3, dayApprox: 21 },
  { name: '청명', month: 4, dayApprox: 5 },
  { name: '곡우', month: 4, dayApprox: 20 },
  { name: '입하', month: 5, dayApprox: 6 },
  { name: '소만', month: 5, dayApprox: 21 },
  { name: '망종', month: 6, dayApprox: 6 },
  { name: '하지', month: 6, dayApprox: 21 },
  { name: '소서', month: 7, dayApprox: 7 },
  { name: '대서', month: 7, dayApprox: 23 },
  { name: '입추', month: 8, dayApprox: 7 },
  { name: '처서', month: 8, dayApprox: 23 },
  { name: '백로', month: 9, dayApprox: 8 },
  { name: '추분', month: 9, dayApprox: 23 },
  { name: '한로', month: 10, dayApprox: 8 },
  { name: '상강', month: 10, dayApprox: 23 },
  { name: '입동', month: 11, dayApprox: 7 },
  { name: '소설', month: 11, dayApprox: 22 },
  { name: '대설', month: 12, dayApprox: 7 },
  { name: '동지', month: 12, dayApprox: 22 },
];

/**
 * 주어진 날짜에 해당하는 24절기를 반환합니다 (±1일 허용).
 * 정확한 계산을 위해서는 KASI API를 사용해야 하지만, 오프라인 근사치로도 충분합니다.
 */
export function getSolarTerm(month: number, day: number): string | null {
  for (const term of SOLAR_TERMS) {
    if (term.month === month && Math.abs(term.dayApprox - day) <= 1) {
      return term.name;
    }
  }
  return null;
}

/**
 * 음력 월 구간에 따른 시기 태그를 반환합니다.
 */
export function getLunarPhaseTags(lunarDay: number): string[] {
  if (lunarDay <= 5) return ['월초', '시작', '새로운 흐름'];
  if (lunarDay <= 14) return ['상현', '성장', '확장기'];
  if (lunarDay === 15) return ['보름', '절정', '에너지 최고조'];
  if (lunarDay <= 22) return ['하현', '수확', '정리기'];
  return ['그믐', '마무리', '내면 돌보기'];
}
