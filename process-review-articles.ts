import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTRUCTURE_MARKERS = ['Current Situation Analysis', 'Why This Matters', 'Core Technical Deep Dive', 'Practical Implementation']

async function main() {
  console.log('🔍 处理 REVIEW 状态文章...\n')

  const { data: reviewArticles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, qualityScore, sourceSite, status, createdAt')
    .eq('status', 'REVIEW')
    .order('createdAt', { ascending: true })

  if (error) { console.error('❌', error.message); return }
  console.log(`REVIEW 文章总数: ${reviewArticles.length}\n`)

  const toPublish: any[] = []
  const toDelete: any[] = []

  for (const a of reviewArticles) {
    const isRestructured = a.contentEn && RESTRUCTURE_MARKERS.some(m => a.contentEn.includes(m))
    const score = a.qualityScore ?? 0
    const isQualified = isRestructured && score >= 65

    if (isQualified) {
      toPublish.push(a)
    } else {
      const reason = !isRestructured ? '未重构' : `分数太低 (${score})`
      toDelete.push({ ...a, deleteReason: reason })
    }
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log(`🚀 将推送上线: ${toPublish.length} 篇 (已重构 + score ≥ 65)`)
  console.log('═══════════════════════════════════════════════════════')
  for (const a of toPublish) {
    console.log(`  ✅ ${a.titleEn?.slice(0,80)} [score: ${a.qualityScore}]`)
  }

  console.log(`\n═══════════════════════════════════════════════════════`)
  console.log(`🗑️  将删除: ${toDelete.length} 篇`)
  console.log('═══════════════════════════════════════════════════════')
  for (const a of toDelete) {
    console.log(`  ❌ ${a.titleEn?.slice(0,80)} [${a.deleteReason}]`)
  }

  // 确认
  console.log(`\n⚠️  即将执行: 推送 ${toPublish.length} 篇, 删除 ${toDelete.length} 篇`)

  // 执行推送
  if (toPublish.length > 0) {
    console.log('\n🚀 开始推送上线...')
    for (const a of toPublish) {
      const { error: updateError } = await supabase
        .from('Article')
        .update({
          isPublished: true,
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
        })
        .eq('id', a.id)
      if (updateError) {
        console.log(`  ❌ 推送失败: ${a.titleEn?.slice(0,50)} - ${updateError.message}`)
      } else {
        console.log(`  ✅ 已推送: ${a.titleEn?.slice(0,80)}`)
      }
    }
  }

  // 执行删除
  if (toDelete.length > 0) {
    console.log('\n🗑️  开始删除不合格文章...')
    for (const a of toDelete) {
      const { error: deleteError } = await supabase
        .from('Article')
        .delete()
        .eq('id', a.id)
      if (deleteError) {
        console.log(`  ❌ 删除失败: ${a.titleEn?.slice(0,50)} - ${deleteError.message}`)
      } else {
        console.log(`  🗑️  已删除: ${a.titleEn?.slice(0,80)}`)
      }
    }
  }

  console.log('\n✅ 处理完成！')
}
main()
