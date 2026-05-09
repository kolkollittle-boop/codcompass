import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Check articles NOT restructured - were they BLOG type?
  const { count: blogCount } = await supabase
    .from('BlogPost')
    .select('*', { count: 'exact', head: true })
  console.log(`BlogPosts (not restructured, by design): ${blogCount}`)

  // KB articles not restructured
  const { count: totalKB } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: restructured } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .ilike('contentEn', '%Current Situation Analysis%')
  
  console.log(`KB Articles total: ${totalKB}`)
  console.log(`KB restructured: ${restructured} (${Math.round(restructured!/totalKB!*100)}%)`)
  console.log(`KB NOT restructured: ${totalKB! - restructured!} (${Math.round((totalKB!-restructured!)/totalKB!*100)}%)`)
}
main()
