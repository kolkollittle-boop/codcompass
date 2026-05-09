import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Article" ALTER COLUMN id SET DEFAULT gen_random_uuid()`)
  console.log('✅ Article.id default set to gen_random_uuid()')
  // Verify
  const result = await prisma.$queryRawUnsafe(`SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'Article' AND column_name = 'id'`)
  console.log(JSON.stringify(result, null, 2))
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e.message); prisma.$disconnect() })
