import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 快速检查数据库状态...\n')

  const { count: total } = await supabase.from('Article').select('*', { count: 'exact', head: true })
  const { count: published } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('isPublished', true)
  const { count: notPublished } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('isPublished', false)
  
  console.log(`数据库总计: ${total}`)
  console.log(`isPublished=true: ${published} (网站应显示)`)
  console.log(`isPublished=false: ${notPublished}`)
  console.log(`差异: ${total! - published!} 篇\n`)

  // 按 status 分布
  const { data: statusData } = await supabase.from('Article').select('status')
  const statusCounts: Record<string, number> = {}
  for (const r of statusData || []) {
    const s = (r.status as string) || '(null)'
    statusCounts[s] = (statusCounts[s] || 0) + 1
  }
  console.log('📋 Status 分布:')
  for (const [s, c] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${s}: ${c}`)
  }

  // 重复 slug 检查
  const { data: allSlugs } = await supabase.from('Article').select('id, slug, titleEn, isPublished')
  if (allSlugs) {
    const slugMap: Record<string, any[]> = {}
    for (const a of allSlugs) {
      if (!a.slug) continue
      if (!slugMap[a.slug]) slugMap[a.slug] = []
      slugMap[a.slug].push(a)
    }
    const duplicates = Object.entries(slugMap).filter(([_, v]) => v.length > 1)
    console.log(`\n🔁 重复 slug: ${duplicates.length} 个`)
    for (const [slug, items] of duplicates.slice(0, 10)) {
      console.log(`   ${slug}: ${items.length} 条`)
      for (const it of items) {
        console.log(`     id: ${it.id.slice(0,8)}... | published: ${it.isPublished} | title: ${it.titleEn?.slice(0,50)}`)
      }
    }
  }

  // 未发布的那 95 篇是什么？
  console.log(`\n📦 未发布的 ${notPublished} 篇:`)
  const { data: notPubData } = await supabase
    .from('Article')
    .select('id, slug, titleEn, status, qualityScore, createdAt')
    .eq('isPublished', false)
    .order('createdAt', { ascending: false })
    .limit(30)
  for (const a of notPubData || []) {
    console.log(`   [${a.status || 'null'}] ${a.titleEn?.slice(0,70) || '(无标题)'} | score: ${a.qualityScore ?? 'N/A'} | ${a.createdAt}`)
  }

  // 已发布但无 qualityScore 的
  const { count: pubNoScore } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('isPublished', true).is('qualityScore', null)
  console.log(`\n❓ 已发布但 qualityScore 为 null: ${pubNoScore}`)

  console.log(`\n═══════════════════════════════════════════════════════`)
  console.log(`✅ 结论: 数据库 ${total} = 已发布 ${published} + 未发布 ${notPublished}`)
  console.log(`   网站显示 ${published} 篇是正确的`)
  console.log(`   用户看到的 "1857" 可能是某个统计页面把未发布的也计入的？`)
  console.log(`═══════════════════════════════════════════════════════`)
}
main()
