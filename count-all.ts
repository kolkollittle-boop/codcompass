import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
async function main() {
  const { count: artCount } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: blogCount } = await supabase.from('BlogPost').select('*', { count: 'exact', head: true })
  console.log(`Articles (KB): ${artCount}`)
  console.log(`BlogPosts: ${blogCount}`)
}
main()
