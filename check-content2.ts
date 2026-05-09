import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // How many articles have the Codcompass 2.0 restructured format?
  const { count: total } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: restructured } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .ilike('contentEn', '%Current Situation Analysis%')
  
  console.log(`Total KB Articles: ${total}`)
  console.log(`Restructured (Codcompass 2.0 format): ${restructured} (${Math.round(restructured!/total!*100)}%)`)
  console.log(`Original content (not restructured): ${total! - restructured!} (${Math.round((total!-restructured!)/total!*100)}%)`)
  
  // Show a restructured vs original sample
  const { data: rs } = await supabase.from('Article').select('titleEn').ilike('contentEn', '%WOW Moment%').limit(1)
  const { data: ns } = await supabase.from('Article').select('titleEn').not('contentEn', 'ilike', '%WOW Moment%').limit(1)
  console.log(`\n📋 Restructured example: ${rs?.[0]?.titleEn}`)
  console.log(`📝 Original example: ${ns?.[0]?.titleEn}`)
}
main()
