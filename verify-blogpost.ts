import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('BlogPost')
    .select('excerpt, seoDescription')
    .limit(30)
  if (error) { console.error(error); return }
  
  const hasChinese = (s: string) => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(s)
  let cn = 0
  for (const r of data) {
    if ((r.excerpt && hasChinese(r.excerpt)) || (r.seoDescription && hasChinese(r.seoDescription))) cn++
  }
  console.log(`Sampled: ${data.length}, Chinese: ${cn}`)
}
main()
