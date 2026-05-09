import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { count: total } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: restructured } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .ilike('contentEn', '%Current Situation%')
  
  console.log(`Total Articles: ${total}`)
  console.log(`Restructured (Codcompass 2.0 format): ${restructured} (${Math.round(restructured!/total!*100)}%)`)
  console.log(`Normal (original content): ${total! - restructured!} (${Math.round((total!-restructured!)/total!*100)}%)`)

  // Check backfilled articles
  const { data: backfilled } = await supabase
    .from('Article')
    .select('id, titleEn, slug')
    .ilike('contentEn', '%backfill%')
    .limit(5)
  console.log(`\nBackfill-tagged articles: ${backfilled?.length || 0}`)
}
main()
