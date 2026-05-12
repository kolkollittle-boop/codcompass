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
    .select('*')
    .limit(1)
  if (error) { console.error(error); return }
  if (data && data.length > 0) {
    console.log('Article columns:', Object.keys(data[0]).join(', '))
    console.log('---')
    console.log(JSON.stringify(data[0], null, 2).slice(0, 3000))
  }
}
main()
