/**
 * 배치 생성 스크립트: 지정한 날짜 범위 × 12띠 운세를 사전 생성하여 DB에 적재합니다.
 *
 * 사용법:
 *   npx tsx scripts/batch-generate.ts              # 기본값: 오늘 ±7일
 *   npx tsx scripts/batch-generate.ts --before=3 --after=14
 *   npx tsx scripts/batch-generate.ts --from=2026-05-01 --to=2026-05-31
 */

import { generateAllFortunesForDate } from '../src/lib/generator';

function parseArgs(): { from: string; to: string } {
  const args = process.argv.slice(2);
  const get = (key: string) => {
    const found = args.find(a => a.startsWith(`--${key}=`));
    return found ? found.split('=')[1] : null;
  };

  const today = new Date();

  // --from / --to 방식
  const fromArg = get('from');
  const toArg = get('to');
  if (fromArg || toArg) {
    return {
      from: fromArg ?? formatDate(today),
      to: toArg ?? formatDate(today),
    };
  }

  // --before / --after 방식 (기본값: ±7일)
  const before = parseInt(get('before') ?? '7', 10);
  const after  = parseInt(get('after')  ?? '7', 10);
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - before);
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + after);

  return { from: formatDate(fromDate), to: formatDate(toDate) };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + 'T12:00:00');
  const end = new Date(to   + 'T12:00:00');
  while (cur <= end) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

async function main() {
  const { from, to } = parseArgs();
  const dates = dateRange(from, to);

  console.log(`🚀 배치 운세 생성 시작 — ${dates.length}일치`);
  console.log(`   📅 범위: ${from} ~ ${to}`);

  let successCount = 0;
  let failCount = 0;

  for (const dateStr of dates) {
    try {
      await generateAllFortunesForDate(dateStr);
      successCount++;
    } catch (error) {
      console.error(`❌ ${dateStr} 생성 실패:`, error);
      failCount++;
    }
  }

  console.log(`\n🏁 배치 생성 완료`);
  console.log(`   ✅ 성공: ${successCount}일 × 12띠 = ${successCount * 12}건`);
  if (failCount > 0) {
    console.log(`   ❌ 실패: ${failCount}일`);
  }
}

main().catch((e) => {
  console.error('배치 실행 중 치명적 오류:', e);
  process.exit(1);
});
