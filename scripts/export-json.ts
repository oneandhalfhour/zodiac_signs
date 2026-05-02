/**
 * SQLite DB에 저장된 운세 데이터를 public/data/fortunes/ 디렉토리에 JSON 파일로 export.
 * npm run export-json  OR  npm run generate (batch 후 자동 실행)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const FORTUNES_DIR = path.join(process.cwd(), 'public', 'data', 'fortunes');
const INDEX_PATH = path.join(process.cwd(), 'public', 'data', 'index.json');

async function main() {
  fs.mkdirSync(FORTUNES_DIR, { recursive: true });

  const fortunes = await prisma.dailyFortune.findMany({
    where: { status: 'published' },
    include: { zodiac: true },
    orderBy: [{ serviceDate: 'asc' }, { zodiac: { orderNo: 'asc' } }],
  });

  if (fortunes.length === 0) {
    console.error('DB에 published 운세가 없습니다. npm run batch를 먼저 실행하세요.');
    process.exit(1);
  }

  // 날짜별로 그룹화
  const byDate = new Map<string, typeof fortunes>();
  for (const f of fortunes) {
    if (!byDate.has(f.serviceDate)) byDate.set(f.serviceDate, []);
    byDate.get(f.serviceDate)!.push(f);
  }

  const availableDates: string[] = [];

  for (const [date, items] of byDate) {
    const zodiacs: Record<string, unknown> = {};
    for (const item of items) {
      zodiacs[item.zodiacId] = {
        zodiacId: item.zodiacId,
        animalNameKo: item.zodiac.animalNameKo,
        displayNameKo: item.zodiac.displayNameKo,
        emoji: item.zodiac.emoji ?? '',
        overallScore: item.overallScore,
        overallText: item.overallText,
        careerText: item.careerText ?? null,
        loveText: item.loveText ?? null,
        healthText: item.healthText ?? null,
        luckyColor: item.luckyColor ?? null,
        luckyNumber: item.luckyNumber ?? null,
        luckyDirection: item.luckyDirection ?? null,
      };
    }

    const payload = {
      date,
      generatedAt: new Date().toISOString(),
      zodiacs,
    };

    fs.writeFileSync(
      path.join(FORTUNES_DIR, `${date}.json`),
      JSON.stringify(payload, null, 2),
    );
    availableDates.push(date);
    console.log(`  ✓ ${date}.json (${items.length}띠)`);
  }

  // index.json 갱신 (내림차순 정렬)
  const manifest = {
    updatedAt: new Date().toISOString(),
    availableDates: [...availableDates].sort().reverse(),
  };
  fs.writeFileSync(INDEX_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ index.json 갱신 완료 (총 ${availableDates.length}일치)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
