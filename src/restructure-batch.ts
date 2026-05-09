#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are a senior technical editor. Restructure the English technical article into Codcompass 2.0 standard format.

Codcompass 2.0 Article Structure:
1. **Current Situation Analysis**: Pain points, failure modes, why traditional methods don't work
2. **WOW Moment**: Experimental data comparison table, key findings, sweet spot
3. **Core Solution**: Technical implementation details, code examples, architecture decisions
4. **Pitfall Guide**: 3-7 common mistakes and best practices
5. **Deliverables**: Downloadable Blueprint, Checklist, configuration templates

Requirements:
- Keep technical depth, do NOT simplify core content
- Add experimental data comparison table
- Extract 3-7 pitfall guides
- Keep code blocks intact
- **OUTPUT IN ENGLISH**
- Keep Markdown format

Output format:

# [Article Title]

## Current Situation Analysis
[Analysis]

## WOW Moment: Key Findings
[Table]

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [A] | [data] | [data] | [data] |
| [B] | [data] | [data] | [data] |

## Core Solution
[Implementation]

## Pitfall Guide
1. **[Name]**: [Explanation]
2. **[Name]**: [Explanation]

## Deliverables
[Description]`

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function restructure(title: string, content: string): Promise<string | null> {
  const body = JSON.stringify({
    model: 'qwen3.5-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Title: ${title}\n\nContent:\n${content.substring(0, 12000)}` },
    ],
    max_tokens: 8000,
    temperature: 0.3,
  })

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) { await sleep(2000 * Math.pow(2, attempt - 1)) }
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 90000)
      const res = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
        body,
        signal: ctrl.signal,
      })
      clearTimeout(t)
      if (!res.ok) { if (res.status === 429 || res.status >= 500) { if (attempt < 3) continue; return null } return null }
      const data = await res.json()
      const c = data.choices?.[0]?.message?.content
      if (!c || c.trim().length < 100) { if (attempt < 3) continue; return null }
      return c
    } catch { if (attempt >= 3) return null }
  }
  return null
}

async function main() {
  const batchNum = parseInt(process.argv[2] || '0')
  const offset = batchNum * 50
  console.log(`🔄 Batch ${batchNum + 1}: offset=${offset}, limit=50`)

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn')
    .range(offset, offset + 49)
  if (error) { console.error(error); process.exit(1) }
  if (!articles?.length) { console.log('✅ No more articles'); return }

  const needRestructure = articles.filter(a => a.contentEn && !a.contentEn.includes('Current Situation Analysis') && a.contentEn.length >= 500)
  console.log(`📊 ${articles.length} fetched, ${needRestructure.length} need restructuring`)

  let ok = 0, fail = 0, skip = 0
  for (let i = 0; i < needRestructure.length; i++) {
    const a = needRestructure[i]
    console.log(`[${i + 1}/${needRestructure.length}] ${a.titleEn.slice(0, 60)}...`)

    const newContent = await restructure(a.titleEn, a.contentEn)
    if (!newContent) { fail++; console.log('  ❌'); continue }

    const { error: updErr } = await supabase.from('Article').update({ contentEn: newContent }).eq('id', a.id)
    if (updErr) { fail++; console.log(`  ❌ DB: ${updErr.message}`) }
    else { ok++; console.log(`  ✅ (${newContent.length} chars)`) }

    if (i < needRestructure.length - 1) await sleep(4000)
  }

  console.log(`\nBatch ${batchNum + 1} done: ✅${ok} ❌${fail} ⏭${skip}`)
}

main().catch(console.error)
