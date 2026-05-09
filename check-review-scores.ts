import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  const { data } = await supabase.from('Article').select('qualityScore, status').eq('status', 'REVIEW')
  if (!data) return
  const total = data.length
  const ge65 = data.filter(a => a.qualityScore !== null && a.qualityScore >= 65).length
  const ge70 = data.filter(a => a.qualityScore !== null && a.qualityScore >= 70).length
  console.log(`REVIEW total: ${total}`)
  console.log(`  score >= 65: ${ge65} (will be auto-published)`)
  console.log(`  score >= 70: ${ge70}`)
  console.log(`  score < 65: ${total - ge65} (will stay in REVIEW)`)
  // Distribution
  const ranges = [[60,64],[65,69],[70,74],[75,79]]
  for (const [lo,hi] of ranges) {
    const cnt = data.filter(a => a.qualityScore !== null && a.qualityScore >= lo && a.qualityScore <= hi).length
    console.log(`  score ${lo}-${hi}: ${cnt}`)
  }
}
main()
