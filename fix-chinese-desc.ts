import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Remove non-ASCII (CJK) characters */
function stripNonAscii(s: string): string {
  return s.replace(/[^\x00-\x7F]/g, '').trim()
}

async function main() {
  // Fetch all articles with descriptionEn
  let offset = 0
  let totalFixed = 0
  let totalChecked = 0
  const hasChinese = (s: string) => /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(s)

  while (true) {
    const { data, error } = await supabase
      .from('Article')
      .select('id, descriptionEn')
      .range(offset, offset + 99)
    if (error) { console.error(error); break }
    if (!data || data.length === 0) break

    for (const a of data) {
      totalChecked++
      if (a.descriptionEn && hasChinese(a.descriptionEn)) {
        const cleaned = stripNonAscii(a.descriptionEn)
        if (cleaned.length > 0) {
          await supabase
            .from('Article')
            .update({ descriptionEn: cleaned })
            .eq('id', a.id)
          totalFixed++
        } else {
          // No ASCII left — use title as fallback
          const { data: art } = await supabase
            .from('Article')
            .select('titleEn')
            .eq('id', a.id)
            .single()
          await supabase
            .from('Article')
            .update({ descriptionEn: (art?.titleEn || '').slice(0, 160) })
            .eq('id', a.id)
          totalFixed++
        }
      }
    }

    offset += 100
    if ((offset / 100) % 5 === 0) {
      console.log(`Checked ${totalChecked}, fixed ${totalFixed}...`)
    }
  }

  console.log(`\n✅ Done! Checked ${totalChecked}, fixed ${totalFixed}`)
}

main()
