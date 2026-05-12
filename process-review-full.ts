import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 重构标记
const RESTRUCTURE_MARKERS = [
  'Current Situation Analysis', 'WOW Moment', 'Core Solution',
  'Pitfall Guide', 'Production Bundle', '## Current Situation',
]

function isRestructured(contentEn: string | null): boolean {
  if (!contentEn) return false
  return RESTRUCTURE_MARKERS.some(m => contentEn.includes(m))
}

function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1').trim()
  if (plainText.length <= maxLength) return plainText
  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'))
  return lastSentenceEnd > maxLength * 0.5 ? truncated.substring(0, lastSentenceEnd + 1) : truncated + '...'
}

/** 调用 OpenRouter 进行文章重构 */
async function restructureArticle(title: string, content: string, difficultyLevel: string): Promise<any> {
  const systemPrompt = `You are a senior technical editor for Codcompass, a premium developer knowledge base.

Your task: Read the source article and write a COMPLETELY NEW, ORIGINAL technical article.

RULES:
- Extract technical facts, then rewrite with NEW title, NEW structure, NEW code examples
- Do NOT copy any sentences from the original
- Use professional technical writing style
- Follow the exact structure below

REQUIRED STRUCTURE (use these exact section headers):
## Current Situation Analysis
(2-3 paragraphs: the problem, why it matters, data/context)

## WOW Moment: Key Findings
(2-3 paragraphs: the breakthrough, comparison table, measurable impact)

## Core Solution: Deep Dive
(3-4 paragraphs: technical explanation, architecture, code examples)

## Pitfall Guide: What Can Go Wrong
(3-5 common mistakes with code examples and fixes)

## Production Bundle
Include: Deployment Checklist, Decision Matrix, and Config Template

Output JSON format:
{
  "title": "NEW compelling technical title",
  "excerpt": "2-3 sentence summary",
  "content": "FULL ARTICLE with all sections above in markdown",
  "difficultyLevel": "${difficultyLevel}",
  "readingTimeMinutes": 8,
  "expectedOutcome": "What reader will achieve"
}`

  const userPrompt = `Source article:
Title: ${title}

Content:
${content.slice(0, 15000)}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://www.codcompass.com',
      'X-Title': 'Codcompass Restructure',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  let text = data.choices?.[0]?.message?.content || ''

  // 提取 JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  throw new Error('No JSON found in response')
}

async function main() {
  console.log('🚀 处理 REVIEW 文章：高分重构推送 + 低分删除\n')

  const { data: reviewArticles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, qualityScore, qualityDetails, sourceSite, status, createdAt, originalUrl')
    .eq('status', 'REVIEW')
    .order('qualityScore', { ascending: false })

  if (error) { console.error('❌', error.message); return }
  if (!reviewArticles || reviewArticles.length === 0) { console.log('✅ 无文章'); return }

  console.log(`REVIEW 文章总数: ${reviewArticles.length}\n`)

  // 分类
  const directPublish: any[] = []    // 已重构 + score >= 65
  const needRestructure: any[] = []  // 未重构 + score >= 65
  const toDelete: any[] = []         // score < 65 或未重构且 score < 65

  for (const a of reviewArticles) {
    const restructured = isRestructured(a.contentEn)
    const score = a.qualityScore ?? 0
    const dl = (a.qualityDetails as any)?.difficulty_level || 'L2'

    if (restructured && score >= 65) {
      directPublish.push({ ...a, difficultyLevel: dl })
    } else if (!restructured && score >= 65) {
      needRestructure.push({ ...a, difficultyLevel: dl })
    } else {
      const reason = !restructured ? '未重构' : `分数太低 (${score})`
      toDelete.push({ ...a, deleteReason: reason })
    }
  }

  console.log(`═══════════════════════════════════════════════════════`)
  console.log(`📋 分类结果:`)
  console.log(`   🟢 直接推送 (已重构+高分): ${directPublish.length} 篇`)
  console.log(`   🔄 需要重构 (未重构+高分): ${needRestructure.length} 篇`)
  console.log(`   🗑️  删除 (低分/不合格): ${toDelete.length} 篇`)
  console.log(`═══════════════════════════════════════════════════════\n`)

  // 步骤1: 直接推送已重构的文章
  if (directPublish.length > 0) {
    console.log(`\n🟢 步骤1: 直接推送 ${directPublish.length} 篇已重构文章`)
    console.log('─'.repeat(60))
    for (const a of directPublish) {
      const { error: e } = await supabase
        .from('Article')
        .update({ status: 'PUBLISHED', isPublished: true, publishedAt: new Date().toISOString() })
        .eq('id', a.id)
      console.log(`  ${e ? '❌' : '✅'} ${a.titleEn?.slice(0,75)} [${a.qualityScore}]`)
    }
  }

  // 步骤2: 重构未重构的高分文章
  if (needRestructure.length > 0) {
    console.log(`\n🔄 步骤2: 重构 ${needRestructure.length} 篇高分未重构文章`)
    console.log('─'.repeat(60))
    for (let i = 0; i < needRestructure.length; i++) {
      const a = needRestructure[i]
      console.log(`\n[${i+1}/${needRestructure.length}] 🔄 重构: ${a.titleEn?.slice(0,75)} [score: ${a.qualityScore}]`)

      try {
        const result = await restructureArticle(a.titleEn || '', a.contentEn || '', a.difficultyLevel)

        if (!result.content || result.content.length < 500) {
          console.log(`  ⚠️ 重构结果太短，跳过`)
          continue
        }

        const hasStructure = ['Current Situation', 'WOW Moment', 'Core Solution', 'Pitfall', 'Production Bundle']
          .some(m => result.content.includes(m))
        if (!hasStructure) {
          console.log(`  ⚠️ 重构缺少标准结构，跳过`)
          continue
        }

        const updateData: any = {
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          titleEn: result.title,
          contentEn: result.content,
          descriptionEn: generateExcerpt(result.content, 300),
          excerptEn: result.excerpt || '',
          difficultyLevel: result.difficultyLevel || a.difficultyLevel,
          readingTime: result.readingTimeMinutes || 8,
          expectedOutcome: result.expectedOutcome || '',
        }

        const { error: e } = await supabase.from('Article').update(updateData).eq('id', a.id)
        console.log(`  ${e ? '❌' : '🎉'} ${e ? e.message : `已发布 (${result.content.length} 字)`}`)

      } catch (err: any) {
        console.log(`  ⛔ 重构失败: ${err?.message?.slice(0, 100) || err}`)
      }

      // API 限流
      if (i < needRestructure.length - 1) {
        console.log('  ⏳ 等待 3 秒...')
        await new Promise(r => setTimeout(r, 3000))
      }
    }
  }

  // 步骤3: 删除不合格文章
  if (toDelete.length > 0) {
    console.log(`\n🗑️  步骤3: 删除 ${toDelete.length} 篇不合格文章`)
    console.log('─'.repeat(60))
    for (const a of toDelete) {
      const { error: e } = await supabase.from('Article').delete().eq('id', a.id)
      console.log(`  ${e ? '❌' : '🗑️'} ${a.titleEn?.slice(0,75)} [${a.deleteReason}]`)
    }
  }

  console.log(`\n✅ 全部处理完成！`)
}
main()
