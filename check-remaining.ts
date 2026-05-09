import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  const { data } = await supabase.from('Article').select('id, titleEn, contentEn').limit(20)
  const remaining = data?.filter(a => a.contentEn && !a.contentEn.includes('Current Situation Analysis')) || []
  console.log(`Need restructuring: ${remaining.length}`)
  for (const a of remaining) {
    console.log(`  ${a.titleEn?.slice(0,60)} (${a.contentEn?.length || 0} chars)`)
  }
}
main()
