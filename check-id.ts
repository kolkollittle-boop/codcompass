import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.$queryRawUnsafe(`SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'Article' AND column_name = 'id'`)
  console.log(JSON.stringify(result, null, 2))
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e.message); prisma.$disconnect() })
