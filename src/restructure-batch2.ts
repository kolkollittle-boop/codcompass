#!/usr/bin/env tsx
/**
 * Batch restructure: processes the NEXT N articles that need restructuring.
 * Usage: npx tsx src/restructure-batch2.ts [batch_size]
 */
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
      if (attempt > 1) await sleep(2000 * Math.pow(2, attempt - 1))
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 90000)
      const res = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
        body, signal: ctrl.signal,
      })
      clearTimeout(t)
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) { if (attempt < 3) continue; return null }
        return null
      }
      const data = await res.json()
      const c = data.choices?.[0]?.message?.content
      if (!c || c.trim().length < 100) { if (attempt < 3) continue; return null }
      return c
    } catch { if (attempt >= 3) return null }
  }
  return null
}

async function main() {
  const batchSize = parseInt(process.argv[2] || '50')
  
  // Fetch ALL articles, filter client-side for those needing restructuring
  let offset = 0
  const allNeedRestructure: Array<{ id: string; titleEn: string; contentEn: string; qualityScore: number | null }> = []
  
  while (true) {
    const { data, error } = await supabase
      .from('Article')
      .select('id, titleEn, contentEn, qualityScore')
      .range(offset, offset + 99)
    if (error || !data?.length) break
    
    for (const a of data) {
      if (a.contentEn && !a.contentEn.includes('Current Situation Analysis') && a.contentEn.length >= 500) {
        allNeedRestructure.push({ id: a.id, titleEn: a.titleEn, contentEn: a.contentEn, qualityScore: a.qualityScore })
      }
    }
    offset += 100
    if (allNeedRestructure.length >= batchSize) break
  }

  const batch = allNeedRestructure.slice(0, batchSize)
  console.log(`📊 ${batch.length} articles to restructure (requested batch of ${batchSize})\n`)

  if (batch.length === 0) {
    console.log('✅ All articles already restructured!')
    return
  }

  let ok = 0, fail = 0
  for (let i = 0; i < batch.length; i++) {
    const a = batch[i]
    console.log(`[${i + 1}/${batch.length}] ${a.titleEn.slice(0, 60)}...`)

    const newContent = await restructure(a.titleEn, a.contentEn)
    if (!newContent) { fail++; console.log('  ❌'); continue }

    // Auto-publish if qualityScore >= 65
    const shouldPublish = a.qualityScore !== null && a.qualityScore >= 65
    const updateData: Record<string, unknown> = { contentEn: newContent }
    if (shouldPublish) {
      updateData.status = 'PUBLISHED'
      updateData.isPublished = true
      updateData.publishedAt = new Date().toISOString()
    }

    const { error: updErr } = await supabase.from('Article').update(updateData).eq('id', a.id)
    if (updErr) { fail++; console.log(`  ❌ DB: ${updErr.message}`) }
    else {
      ok++
      const publishTag = shouldPublish ? ' 🚀 PUBLISHED' : ''
      console.log(`  ✅ (${newContent.length} chars, score=${a.qualityScore})${publishTag}`)
    }

    if (i < batch.length - 1) await sleep(4000)
  }

  console.log(`\n✅ Done: ${ok} succeeded, ${fail} failed`)
}

main().catch(console.error)
