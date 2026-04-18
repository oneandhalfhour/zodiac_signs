/**
 * 배치 생성 스크립트: 향후 30일치 × 12띠 운세를 사전 생성하여 DB에 적재합니다.
 * PDF 가이드라인 7.1절 "배치 스케줄링을 통한 트래픽 스파이크 대응"
 *
 * 사용법: npx tsx scripts/batch-generate.ts
 */

import { generateAllFortunesForDate } from '../src/lib/generator';

async function main() {
  const DAYS_AHEAD = 30;
  const today = new Date();

  console.log(`🚀 배치 운세 생성 시작 — ${DAYS_AHEAD}일치`);
  console.log(`   시작 날짜: ${formatDate(today)}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dateStr = formatDate(targetDate);

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

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

main().catch((e) => {
  console.error('배치 실행 중 치명적 오류:', e);
  process.exit(1);
});
