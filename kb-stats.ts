import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
async function main() {
  const { count: totalKB } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: restructured } = await supabase.from('Article').select('*', { count: 'exact', head: true }).ilike('contentEn', '%Current Situation Analysis%')
  const { count: blogPosts } = await supabase.from('BlogPost').select('*', { count: 'exact', head: true })
  const { count: featured } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('isFeatured', true)
  const { count: published } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED')
  const { count: review } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', 'REVIEW')
  const { count: draft } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT')
  const { count: archived } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', 'ARCHIVED')

  console.log(`KB Articles: ${totalKB}`)
  console.log(`  Restructured: ${restructured} (${Math.round(restructured!/totalKB!*100)}%)`)
  console.log(`  Featured: ${featured}`)
  console.log(`  PUBLISHED: ${published}`)
  console.log(`  REVIEW: ${review}`)
  console.log(`  DRAFT: ${draft}`)
  console.log(`  ARCHIVED: ${archived}`)
  console.log(`BlogPosts: ${blogPosts}`)
}
main()
