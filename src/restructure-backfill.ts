#!/usr/bin/env tsx
/**
 * Batch restructure all KB articles that don't have Codcompass 2.0 format.
 * Usage: npx tsx src/restructure-backfill.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTRUCTURE_SYSTEM_PROMPT = `You are a senior technical editor. Restructure the English technical article into Codcompass 2.0 standard format.

Codcompass 2.0 Article Structure:
1. **Current Situation Analysis**: Pain points, failure modes, why traditional methods don't work
2. **WOW Moment**: Experimental data comparison table, key findings, sweet spot
3. **Core Solution**: Technical implementation details, code examples, architecture decisions
4. **Pitfall Guide**: 3-7 common mistakes and best practices
5. **Deliverables**: Downloadable Blueprint, Checklist, configuration templates

Requirements:
- Keep technical depth, do NOT simplify core content
- Add experimental data comparison table (if original doesn't have one, infer reasonable data based on technical knowledge)
- Extract 3-7 pitfall guides
- Keep code blocks intact, do NOT modify them
- **OUTPUT IN ENGLISH** (keep technical terms as-is)
- Keep Markdown format

Output format (strictly follow this template):

# [Article Title]

## Current Situation Analysis
[Pain points and failure mode analysis]

## WOW Moment: Key Findings
[Experimental data comparison table]

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [Approach A] | [data] | [data] | [data] |
| [Approach B] | [data] | [data] | [data] |

## Core Solution
[Technical implementation and code examples]

## Pitfall Guide
1. **[Pitfall Name]**: [Detailed explanation]
2. **[Pitfall Name]**: [Detailed explanation]
...

## Deliverables
[Blueprint and Checklist description]`

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callRestructureApi(title: string, content: string): Promise<string | null> {
  const contentWindow = content.substring(0, 12000)

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) {
        const backoff = 2000 * Math.pow(2, attempt - 1)
        console.log(`    🔄 Retry ${attempt}/3, wait ${backoff}ms...`)
        await sleep(backoff)
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 90000)

      const res = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen3.5-plus',
          messages: [
            { role: 'system', content: RESTRUCTURE_SYSTEM_PROMPT },
            { role: 'user', content: `Title: ${title}\n\nContent:\n${contentWindow}` },
          ],
          max_tokens: 8000,
          temperature: 0.3,
        }),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) {
        const status = res.status
        if (status === 429 || status >= 500) {
          if (attempt < 3) continue
          return null
        }
        const body = await res.text().catch(() => '')
        console.log(`    ❌ API error ${status}: ${body.slice(0, 100)}`)
        return null
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (!content || content.trim().length < 100) {
        if (attempt < 3) continue
        return null
      }
      return content

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt >= 3) {
        console.log(`    ❌ Failed: ${msg.slice(0, 100)}`)
        return null
      }
    }
  }
  return null
}

async function main() {
  console.log('🔄 Fetching articles that need restructuring...\n')

  // Fetch all KB articles
  let offset = 0
  const batchSize = 100
  const toRestructure: Array<{ id: string; titleEn: string; contentEn: string }> = []

  while (true) {
    const { data, error } = await supabase
      .from('Article')
      .select('id, titleEn, contentEn')
      .range(offset, offset + batchSize - 1)
    if (error) { console.error(error); break }
    if (!data || data.length === 0) break

    for (const a of data) {
      if (a.contentEn && !a.contentEn.includes('Current Situation Analysis')) {
        toRestructure.push({ id: a.id, titleEn: a.titleEn, contentEn: a.contentEn })
      }
    }
    offset += batchSize
  }

  console.log(`📊 Found ${toRestructure.length} articles to restructure\n`)

  if (toRestructure.length === 0) {
    console.log('✅ All articles already restructured.')
    return
  }

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (let i = 0; i < toRestructure.length; i++) {
    const article = toRestructure[i]
    console.log(`[${i + 1}/${toRestructure.length}] 📝 ${article.titleEn.slice(0, 60)}...`)

    // Skip if content is too short
    if (article.contentEn.length < 500) {
      console.log(`  ⏭ Skip: content too short (${article.contentEn.length} chars)`)
      skipCount++
      continue
    }

    const newContent = await callRestructureApi(article.titleEn, article.contentEn)

    if (!newContent) {
      failCount++
      continue
    }

    // Update the article
    const { error } = await supabase
      .from('Article')
      .update({ contentEn: newContent })
      .eq('id', article.id)

    if (error) {
      console.log(`  ❌ DB update failed: ${error.message}`)
      failCount++
    } else {
      successCount++
      console.log(`  ✅ Restructured (${newContent.length} chars)`)
    }

    // Rate limit: 4s between calls
    if (i < toRestructure.length - 1) {
      await sleep(4000)
    }

    // Progress every 10
    if ((i + 1) % 10 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${toRestructure.length} | ✅${successCount} ❌${failCount} ⏭${skipCount} ---\n`)
    }
  }

  console.log(`\n🎉 Restructure complete!`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⏭ Skipped: ${skipCount}`)
  console.log(`📊 Total: ${toRestructure.length}`)
}

main().catch(console.error)
