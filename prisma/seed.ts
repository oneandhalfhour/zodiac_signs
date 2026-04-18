import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const zodiacData = [
  { zodiacId: 'rat', branchCode: 'ja', animalNameKo: '쥐', displayNameKo: '쥐띠', orderNo: 1, emoji: '🐭' },
  { zodiacId: 'ox', branchCode: 'chuk', animalNameKo: '소', displayNameKo: '소띠', orderNo: 2, emoji: '🐮' },
  { zodiacId: 'tiger', branchCode: 'in', animalNameKo: '호랑이', displayNameKo: '호랑이띠', orderNo: 3, emoji: '🐯' },
  { zodiacId: 'rabbit', branchCode: 'myo', animalNameKo: '토끼', displayNameKo: '토끼띠', orderNo: 4, emoji: '🐰' },
  { zodiacId: 'dragon', branchCode: 'jin', animalNameKo: '용', displayNameKo: '용띠', orderNo: 5, emoji: '🐲' },
  { zodiacId: 'snake', branchCode: 'sa', animalNameKo: '뱀', displayNameKo: '뱀띠', orderNo: 6, emoji: '🐍' },
  { zodiacId: 'horse', branchCode: 'o', animalNameKo: '말', displayNameKo: '말띠', orderNo: 7, emoji: '🐴' },
  { zodiacId: 'sheep', branchCode: 'mi', animalNameKo: '양', displayNameKo: '양띠', orderNo: 8, emoji: '🐑' },
  { zodiacId: 'monkey', branchCode: 'sin', animalNameKo: '원숭이', displayNameKo: '원숭이띠', orderNo: 9, emoji: '🐵' },
  { zodiacId: 'rooster', branchCode: 'yu', animalNameKo: '닭', displayNameKo: '닭띠', orderNo: 10, emoji: '🐔' },
  { zodiacId: 'dog', branchCode: 'sul', animalNameKo: '개', displayNameKo: '개띠', orderNo: 11, emoji: '🐶' },
  { zodiacId: 'pig', branchCode: 'hae', animalNameKo: '돼지', displayNameKo: '돼지띠', orderNo: 12, emoji: '🐷' },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const z of zodiacData) {
    const zodiac = await prisma.zodiacSign.upsert({
      where: { zodiacId: z.zodiacId },
      update: z,
      create: z,
    })
    console.log(`Created zodiac sign: ${zodiac.displayNameKo}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
