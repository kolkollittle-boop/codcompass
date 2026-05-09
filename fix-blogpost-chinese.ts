import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

function stripNonAscii(s: string): string {
  return s.replace(/[^\x00-\x7F]/g, '').trim()
}
const hasChinese = (s: string) => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(s)

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, excerpt: true, seoDescription: true, title: true, slug: true },
  })
  console.log(`Total BlogPosts: ${posts.length}`)

  let fixed = 0
  for (const p of posts) {
    let changes: Record<string, string | null> = {}
    
    if (p.excerpt && hasChinese(p.excerpt)) {
      const cleaned = stripNonAscii(p.excerpt)
      changes.excerpt = cleaned || null
    }
    if (p.seoDescription && hasChinese(p.seoDescription)) {
      const cleaned = stripNonAscii(p.seoDescription)
      changes.seoDescription = cleaned || `Source: (auto-generated)`
    }
    
    if (Object.keys(changes).length > 0) {
      await prisma.blogPost.update({ where: { id: p.id }, data: changes })
      fixed++
    }
  }

  console.log(`✅ Fixed ${fixed} BlogPosts with Chinese excerpt/seoDescription`)
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e.message); prisma.$disconnect() })
