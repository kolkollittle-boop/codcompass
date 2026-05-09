import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function stripNonAscii(s: string): string {
  return s.replace(/[^\x00-\x7F]/g, '').trim()
}
const hasChinese = (s: string) => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(s)

async function main() {
  let offset = 0
  let fixed = 0
  let total = 0

  while (true) {
    const { data, error } = await supabase
      .from('BlogPost')
      .select('id, excerpt, seoDescription, title')
      .range(offset, offset + 99)
    if (error) { console.error(error); break }
    if (!data || data.length === 0) break

    for (const p of data) {
      total++
      let changes: Record<string, string | null> = {}

      if (p.excerpt && hasChinese(p.excerpt)) {
        const cleaned = stripNonAscii(p.excerpt)
        changes.excerpt = cleaned || null
      }
      if (p.seoDescription && hasChinese(p.seoDescription)) {
        const cleaned = stripNonAscii(p.seoDescription)
        changes.seoDescription = cleaned || `Source: (auto-generated)`
      }

      if (Object.keys(changes).length > 0) {
        await supabase.from('BlogPost').update(changes).eq('id', p.id)
        fixed++
      }
    }

    offset += 100
    console.log(`Progress: checked ${total}, fixed ${fixed}...`)
  }

  console.log(`\n✅ Done! Checked ${total}, fixed ${fixed}`)
}
main()
