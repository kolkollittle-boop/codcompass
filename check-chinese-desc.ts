import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, titleEn: true, descriptionEn: true },
    where: { descriptionEn: { not: null } },
    take: 20,
  })
  // Check for Chinese characters
  const hasChinese = (s: string) => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(s)
  let chineseCount = 0
  for (const a of articles) {
    if (a.descriptionEn && hasChinese(a.descriptionEn)) {
      chineseCount++
      console.log(`[${a.id.slice(0,8)}] ${a.descriptionEn!.slice(0,80)}`)
    }
  }
  console.log(`\nSampled ${articles.length}, ${chineseCount} have Chinese chars`)
  
  // Count total
  const total = await prisma.article.count({ where: { descriptionEn: { not: null } } })
  console.log(`Total articles with descriptionEn: ${total}`)
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e.message); prisma.$disconnect() })
