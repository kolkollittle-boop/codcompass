import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
async function main() {
  // Single query: fetch all articles with status/isFeatured flags, count in one pass
  const { data: articles, count: totalKB } = await supabase
    .from('Article')
    .select('status, isFeatured, contentEn', { count: 'exact', head: false })

  const { count: blogPosts } = await supabase.from('BlogPost').select('*', { count: 'exact', head: true })

  let restructured = 0
  let featured = 0
  let published = 0
  let review = 0
  let draft = 0
  let archived = 0

  for (const a of articles ?? []) {
    if (a.isFeatured) featured++
    if (a.contentEn?.toLowerCase().includes('current situation analysis')) restructured++
    switch (a.status) {
      case 'PUBLISHED': published++; break
      case 'REVIEW': review++; break
      case 'DRAFT': draft++; break
      case 'ARCHIVED': archived++; break
    }
  }

  console.log(`KB Articles: ${totalKB}`)
  console.log(`  Restructured: ${restructured} (${totalKB ? Math.round(restructured / totalKB * 100) : 0}%)`)
  console.log(`  Featured: ${featured}`)
  console.log(`  PUBLISHED: ${published}`)
  console.log(`  REVIEW: ${review}`)
  console.log(`  DRAFT: ${draft}`)
  console.log(`  ARCHIVED: ${archived}`)
  console.log(`BlogPosts: ${blogPosts}`)
}
main()
