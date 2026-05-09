import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Check a few KB articles to see if they have restructured content
  const { data, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, slug')
    .eq('status', 'PUBLISHED')
    .limit(3)
  if (error) { console.error(error); return }

  for (const a of data) {
    const hasStructure = a.contentEn?.includes('Current Situation Analysis') ||
                         a.contentEn?.includes('WOW Moment') ||
                         a.contentEn?.includes('Pitfall Guide') ||
                         a.contentEn?.includes('## Current Situation')
    console.log(`\n📝 ${a.titleEn?.slice(0,60)}`)
    console.log(`   has_codcompass_structure: ${hasStructure}`)
    console.log(`   content_preview: ${a.contentEn?.slice(0,120)}`)
  }

  // Count how many have the structure
  const { count } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .ilike('contentEn', '%Current Situation%')
  console.log(`\n📊 Articles with Codcompass 2.0 structure: ~${count}`)
}
main()
