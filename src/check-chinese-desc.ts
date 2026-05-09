#!/usr/bin/env tsx
/** Check how many articles have Chinese characters in descriptionEn */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  let offset = 0
  const chineseDesc: Array<{ id: string; titleEn: string; descriptionEn: string; status: string }> = []

  while (true) {
    const { data, error } = await supabase
      .from('Article')
      .select('id, titleEn, descriptionEn, status')
      .range(offset, offset + 199)
    if (error || !data?.length) break

    for (const a of data) {
      if (a.descriptionEn && /[\u4e00-\u9fff]/.test(a.descriptionEn)) {
        chineseDesc.push({ id: a.id, titleEn: a.titleEn, descriptionEn: a.descriptionEn, status: a.status })
      }
    }
    offset += 200
  }

  console.log(`Found ${chineseDesc.length} articles with Chinese in descriptionEn`)
  for (const a of chineseDesc) {
    console.log(`  - [${a.status}] ${a.titleEn.slice(0, 70)}`)
    console.log(`    desc: ${a.descriptionEn.slice(0, 150)}`)
  }
}

main().catch(console.error)
