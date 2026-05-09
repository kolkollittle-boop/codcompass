#!/usr/bin/env tsx
/**
 * Fix: Regenerate English descriptionEn for articles where descriptionEn contains Chinese characters.
 * 
 * Usage: npx tsx src/fix-chinese-desc.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DRY_RUN = process.argv.includes('--dry-run')

const SYSTEM_PROMPT = `You are a technical editor. Generate a concise English description (1-2 sentences, ~100-150 characters) for this technical article.
Output ONLY the description text, nothing else. No quotes, no markdown.`

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function generateDescription(title: string, content: string): Promise<string | null> {
  // Use first 3000 chars of content as context
  const truncated = content.substring(0, 3000)
  const body = JSON.stringify({
    model: 'qwen3.5-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Title: ${title}\n\nContent excerpt:\n${truncated}` },
    ],
    max_tokens: 200,
    temperature: 0.3,
  })
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await sleep(2000 * Math.pow(2, attempt - 1))
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 60000)
      const res = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
        body, signal: ctrl.signal,
      })
      clearTimeout(t)
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.warn(`  API error ${res.status}: ${errText.slice(0, 200)}`)
        if (res.status === 429 || res.status >= 500) continue
        return null
      }
      const data = await res.json()
      const c = data.choices?.[0]?.message?.content?.trim()
      if (!c || c.length < 10) continue
      // Strip quotes if present
      return c.replace(/^["'"]+|["'"]+$/g, '').trim()
    } catch (e: any) {
      console.warn(`  Attempt ${attempt} failed: ${e.message}`)
      if (attempt >= 3) return null
    }
  }
  return null
}

async function main() {
  // Step 1: Find all articles with Chinese in descriptionEn
  let offset = 0
  const chineseDesc: Array<{ id: string; titleEn: string; descriptionEn: string; contentEn: string | null }> = []

  console.log('🔍 Scanning articles...')
  while (true) {
    const { data, error } = await supabase
      .from('Article')
      .select('id, titleEn, descriptionEn, contentEn')
      .range(offset, offset + 199)
    if (error || !data?.length) break

    for (const a of data) {
      if (a.descriptionEn && /[\u4e00-\u9fff]/.test(a.descriptionEn)) {
        chineseDesc.push({ id: a.id, titleEn: a.titleEn, descriptionEn: a.descriptionEn, contentEn: a.contentEn })
      }
    }
    offset += 200
  }

  if (chineseDesc.length === 0) {
    console.log('✅ No articles with Chinese in descriptionEn found.')
    return
  }

  console.log(`\n📋 Found ${chineseDesc.length} articles to fix`)

  let ok = 0, fail = 0

  for (let i = 0; i < chineseDesc.length; i++) {
    const a = chineseDesc[i]
    console.log(`\n[${i + 1}/${chineseDesc.length}] ${a.titleEn.slice(0, 70)}`)
    console.log(`  Current: ${a.descriptionEn.slice(0, 100)}`)

    if (DRY_RUN) {
      console.log('  🏃 Dry run, skipping')
      ok++
      continue
    }

    const newDesc = await generateDescription(a.titleEn, a.contentEn || '')
    if (!newDesc) {
      fail++
      console.log('  ❌ Failed to generate English description')
      continue
    }

    // Verify no Chinese in result
    if (/[\u4e00-\u9fff]/.test(newDesc)) {
      fail++
      console.log(`  ❌ AI still returned Chinese: ${newDesc.slice(0, 100)}`)
      continue
    }

    const { error: updErr } = await supabase.from('Article').update({ descriptionEn: newDesc }).eq('id', a.id)
    if (updErr) {
      fail++
      console.log(`  ❌ DB update failed: ${updErr.message}`)
    } else {
      ok++
      console.log(`  ✅ Updated: ${newDesc.slice(0, 120)}`)
    }

    // Rate limit: wait between requests
    if (i < chineseDesc.length - 1) await sleep(3000)
  }

  console.log(`\n✅ Done: ${ok} fixed, ${fail} failed`)
}

main().catch(console.error)
