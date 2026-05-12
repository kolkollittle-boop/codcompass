import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 重构3.0 标志
const RESTRUCTURE_MARKERS = [
  'Current Situation Analysis',
  'Why This Matters',
  'Core Technical Deep Dive',
  'Practical Implementation',
  'Common Pitfalls',
  'Key Takeaways',
]

async function main() {
  console.log('🔍 检查正式环境所有文章重构状态...\n')

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, sourceSite, status, isPublished, publishedAt, qualityScore, createdAt, originalUrl')
    .order('createdAt', { ascending: true })

  if (error) {
    console.error('❌ 查询失败:', error.message)
    process.exit(1)
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️ 没有找到任何文章')
    return
  }

  console.log(`📊 文章总数: ${articles.length}\n`)

  const restructured: any[] = []
  const notRestructured: any[] = []
  const empty: any[] = []

  for (const a of articles) {
    const hasContent = a.contentEn && a.contentEn.length > 100
    if (!hasContent) {
      empty.push(a)
      continue
    }
    const hasMarker = RESTRUCTURE_MARKERS.some(m => a.contentEn!.includes(m))
    if (hasMarker) {
      restructured.push(a)
    } else {
      notRestructured.push(a)
    }
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log('📈 重构状态汇总')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`✅ 已重构:     ${restructured.length} 篇 (${Math.round(restructured.length/articles.length*100)}%)`)
  console.log(`❌ 未重构:     ${notRestructured.length} 篇 (${Math.round(notRestructured.length/articles.length*100)}%)`)
  console.log(`⚠️  内容为空:   ${empty.length} 篇`)
  console.log('')

  // 未重构但已发布的文章（紧急！）
  const publishedNotRestructured = notRestructured.filter(a => a.isPublished)
  if (publishedNotRestructured.length > 0) {
    console.log('═══════════════════════════════════════════════════════')
    console.log(`🚨 紧急：${publishedNotRestructured.length} 篇未重构但已发布的文章（应立即下线）`)
    console.log('═══════════════════════════════════════════════════════')
    for (const a of publishedNotRestructured) {
      console.log(`🔴 ${a.titleEn?.slice(0,90) || '(无标题)'}`)
      console.log(`   slug: ${a.slug}`)
      console.log(`   URL: https://www.codcompass.com/kb/${a.slug}`)
      console.log(`   source: ${a.sourceSite || 'unknown'} | qualityScore: ${a.qualityScore ?? 'N/A'} | published: ${a.publishedAt || a.createdAt}`)
      console.log('')
    }
  }

  // 未重构但未发布的文章
  const draftNotRestructured = notRestructured.filter(a => !a.isPublished)
  if (draftNotRestructured.length > 0) {
    console.log('═══════════════════════════════════════════════════════')
    console.log(`📝 未重构且未发布（草稿状态，需要重构后才能发布）: ${draftNotRestructured.length} 篇`)
    console.log('═══════════════════════════════════════════════════════')
    for (const a of draftNotRestructured) {
      console.log(`⚪ ${a.titleEn?.slice(0,90) || '(无标题)'}`)
      console.log(`   slug: ${a.slug} | status: ${a.status} | source: ${a.sourceSite || 'unknown'}`)
      console.log('')
    }
  }

  // 已重构文章汇总
  if (restructured.length > 0) {
    const publishedR = restructured.filter(a => a.isPublished)
    const draftR = restructured.filter(a => !a.isPublished)
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ 已重构文章')
    console.log(`   已发布: ${publishedR.length} 篇 | 草稿: ${draftR.length} 篇`)
    console.log('═══════════════════════════════════════════════════════')
    for (const a of restructured) {
      const pub = a.isPublished ? '🟢' : '⚪'
      const score = a.qualityScore ? `score: ${a.qualityScore}` : 'score: N/A'
      console.log(`${pub} ${a.titleEn?.slice(0,80) || '(无标题)'} [${score}]`)
    }
    console.log('')
  }
}
main()
