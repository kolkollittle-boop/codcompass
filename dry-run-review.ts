import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESTRUCTURE_MARKERS = ['Current Situation Analysis', 'Why This Matters', 'Core Technical Deep Dive', 'Practical Implementation']

async function main() {
  console.log('📋 REVIEW 文章分类预览...\n')

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
      toDelete.push({ ...a, deleteReason: reason, isRestructured, score })
    }
  }

  console.log(`═══════════════════════════════════════════════════════`)
  console.log(`🚀 将推送: ${toPublish.length} 篇`)
  console.log(`🗑️  将删除: ${toDelete.length} 篇`)
  console.log(`═══════════════════════════════════════════════════════`)

  console.log('\n📋 将推送的:')
  for (const a of toPublish) {
    console.log(`  ✅ [${a.qualityScore}] ${a.titleEn?.slice(0,85)}`)
  }

  console.log(`\n📋 将删除的 (${toDelete.length} 篇):`)
  for (const a of toDelete) {
    console.log(`  ❌ [${a.score}] ${a.titleEn?.slice(0,85)} → ${a.deleteReason}`)
  }
}
main()
