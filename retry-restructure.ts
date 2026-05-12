import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTRUCTURE_MARKERS = [
  'Current Situation Analysis', 'WOW Moment', 'Core Solution',
  'Pitfall Guide', 'Production Bundle',
]

function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false
  return RESTRUCTURE_MARKERS.some(m => contentEn.includes(m))
}

function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content.replace(/#{1,6}\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1').trim()
  if (plainText.length <= maxLength) return plainText
  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'))
  return lastSentenceEnd > maxLength * 0.5 ? truncated.substring(0, lastSentenceEnd + 1) : truncated + '...'
}

async function restructureArticle(title: string, content: string, difficultyLevel: string): Promise<any> {
  const systemPrompt = `You are a senior technical editor for Codcompass, a premium developer knowledge base.

Write a COMPLETELY NEW, ORIGINAL technical article from the source material below.

RULES:
- Extract technical facts, then rewrite with NEW title, NEW structure, NEW code examples
- Do NOT copy any sentences from the original
- Professional technical writing style

REQUIRED STRUCTURE:
## Current Situation Analysis
(2-3 paragraphs: the problem, why it matters, data/context)

## WOW Moment: Key Findings
(A data comparison table + 2-3 paragraphs explaining the breakthrough)

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|

## Core Solution
(Step-by-step technical implementation with NEW code examples)

## Pitfall Guide
(5-7 common mistakes with detailed explanations and fixes)

## Production Bundle
### Action Checklist (5-8 items)
### Decision Matrix (comparison table)
### Configuration Template
### Quick Start Guide (3-5 steps)

Output ONLY valid JSON:
{"title": "new title", "excerpt": "summary", "content": "full article in markdown", "difficultyLevel": "${difficultyLevel}", "readingTimeMinutes": 8, "expectedOutcome": "reader outcome"}`

  const res = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Source title: "${title}"\n\nSource content:\n${content.slice(0, 12000)}` },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  let text = data.output?.text || data.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Empty response from API')

  // 提取 JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return JSON.parse(jsonMatch[0])
  throw new Error('No JSON in response: ' + text.slice(0, 200))
}

async function main() {
  console.log('🚀 重试重构 7 篇高分未重构文章\n')

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails')
    .eq('status', 'REVIEW')
    .order('qualityScore', { ascending: false })

  if (error || !articles) { console.error('❌', error?.message); return }

  const unrestructuredHighScore = articles.filter(a => !isRestructured(a.contentEn) && (a.qualityScore ?? 0) >= 60)
  console.log(`待重构: ${unrestructuredHighScore.length} 篇\n`)

  for (let i = 0; i < unrestructuredHighScore.length; i++) {
    const a = unrestructuredHighScore[i]
    const dl = (a.qualityDetails as any)?.difficulty_level || 'L2'
    console.log(`[${i+1}/${unrestructuredHighScore.length}] 🔄 ${a.titleEn?.slice(0,75)} [score: ${a.qualityScore}]`)

    try {
      const result = await restructureArticle(a.titleEn || '', a.contentEn || '', dl)
      if (!result.content || result.content.length < 500) { console.log('  ⚠️ 太短，跳过'); continue }

      const hasStructure = ['Current Situation', 'WOW Moment', 'Core Solution', 'Pitfall', 'Production Bundle'].some(m => result.content.includes(m))
      if (!hasStructure) { console.log('  ⚠️ 缺少结构，跳过'); continue }

      const { error: e } = await supabase.from('Article').update({
        status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString(),
        titleEn: result.title, contentEn: result.content,
        descriptionEn: generateExcerpt(result.content, 300),
        excerptEn: result.excerpt || '', difficultyLevel: result.difficultyLevel || dl,
        readingTime: result.readingTimeMinutes || 8, expectedOutcome: result.expectedOutcome || '',
      }).eq('id', a.id)

      console.log(`  ${e ? '❌' : '🎉'} ${e ? e.message : `已发布 (${result.content.length} 字)`}`)
    } catch (err: any) {
      console.log(`  ⛔ 失败: ${err?.message?.slice(0, 150)}`)
    }

    if (i < unrestructuredHighScore.length - 1) {
      console.log('  ⏳ 等待 5 秒...')
      await new Promise(r => setTimeout(r, 5000))
    }
  }

  console.log('\n✅ 完成！')
}
main()
