import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
async function main() {
  const { count: total } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: restructured } = await supabase.from('Article').select('*', { count: 'exact', head: true }).ilike('contentEn', '%Current Situation Analysis%')
  console.log(`Total: ${total}, Restructured: ${restructured} (${Math.round(restructured!/total!*100)}%), Still need: ${total! - restructured!}`)
}
main()
