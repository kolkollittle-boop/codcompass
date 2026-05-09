import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('Article')
    .select('id, descriptionEn, titleEn')
    .limit(50)
  if (error) { console.error(error); return }
  
  let chineseCount = 0
  data.forEach(a => {
    if (a.descriptionEn && /[\u4e00-\u9fff]/.test(a.descriptionEn)) {
      chineseCount++
      console.log('  CN:', a.descriptionEn!.slice(0, 100))
    }
  })
  console.log(`Sampled: ${data.length}, Chinese: ${chineseCount}`)
}
main()
