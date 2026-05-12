import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 分析数据库中文章状态分布...\n')

  // 1. 总文章数
  const { count: total, error: totalErr } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
  if (totalErr) { console.error('total error:', totalErr); return }
  console.log(`📊 Article 表总记录数: ${total}`)

  // 2. 按 isPublished 统计
  const { count: published, error: pubErr1 } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .eq('isPublished', true)
  if (pubErr1) { console.error(pubErr1); return }

  const { count: notPublished, error: pubErr2 } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .eq('isPublished', false)
  if (pubErr2) { console.error(pubErr2); return }

  console.log(`\n📈 发布状态分布:`)
  console.log(`   isPublished = true:  ${published}`)
  console.log(`   isPublished = false: ${notPublished}`)

  // 3. 按 status 统计
  const statuses = ['PUBLISHED', 'REVIEW', 'DRAFT', 'ARCHIVED', 'PENDING']
  console.log(`\n📋 按 status 分布:`)
  for (const s of statuses) {
    const { count } = await supabase.from('Article').select('*', { count: 'exact', head: true }).eq('status', s)
    console.log(`   ${s}: ${count}`)
  }
  // 查非标准 status
  const { data: otherStatuses } = await supabase
    .from('Article')
    .select('status')
    .not('status', 'in', `(${statuses.map(s => `'${s}'`).join(',')})`)
    .limit(100)
  if (otherStatuses && otherStatuses.length > 0) {
    const counts: Record<string, number> = {}
    for (const r of otherStatuses) {
      counts[r.status || '(null)'] = (counts[r.status || '(null)'] || 0) + 1
    }
    console.log(`   其他状态:`, counts)
  }

  // 4. 已发布但有内容的 vs 已发布但无内容的
  const { count: publishedWithContent } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .eq('isPublished', true)
    .gt('contentEn', '')
    .not('contentEn', 'is', null)
  console.log(`\n📝 已发布 + 有内容: ${publishedWithContent}`)

  // 5. 已发布但无内容或内容极短
  const { data: publishedEmpty } = await supabase
    .from('Article')
    .select('id, slug, titleEn, status, qualityScore, createdAt')
    .eq('isPublished', true)
    .or('contentEn.is.null,contentEn.eq.')
    .limit(50)
  if (publishedEmpty && publishedEmpty.length > 0) {
    console.log(`\n⚠️  已发布但内容为空/极短: ${publishedEmpty.length} 篇`)
    for (const a of publishedEmpty) {
      console.log(`   ${a.titleEn?.slice(0,70) || '(无标题)'} [${a.status}] score:${a.qualityScore ?? 'N/A'}`)
    }
  }

  // 6. 未重构但已发布的（之前发现的6篇）
  const RESTRUCTURE_MARKERS = ['Current Situation Analysis', 'Why This Matters', 'Core Technical Deep Dive']
  const { data: publishedNotRestructured } = await supabase
    .from('Article')
    .select('id, slug, titleEn, status, isPublished, qualityScore, createdAt')
    .eq('isPublished', true)
  console.log(`\n🔍 已发布文章总数: ${published}`)
  
  let notRestructuredCount = 0
  for (const a of publishedNotRestructured || []) {
    const { data: row } = await supabase.from('Article').select('contentEn').eq('id', a.id).single()
    if (row?.contentEn && !RESTRUCTURE_MARKERS.some(m => row.contentEn.includes(m))) {
      notRestructuredCount++
    }
  }
  console.log(`   未重构但已发布: ${notRestructuredCount} 篇`)
  console.log(`   已重构且已发布: ${published! - notRestructuredCount} 篇`)

  // 7. 差异分析
  const diff = total! - published!
  console.log(`\n═══════════════════════════════════════════════════════`)
  console.log(`📊 差异分析`)
  console.log(`   数据库总计: ${total}`)
  console.log(`   isPublished=true: ${published} (网站应显示这个数)`)
  console.log(`   isPublished=false: ${notPublished} (草稿/下线)`)
  console.log(`   差异: ${diff}`)
  console.log(`═══════════════════════════════════════════════════════`)

  // 8. 是否有重复 slug？
  const { data: slugs } = await supabase.from('Article').select('slug')
  if (slugs) {
    const slugCounts: Record<string, number> = {}
    for (const s of slugs) {
      if (s.slug) slugCounts[s.slug] = (slugCounts[s.slug] || 0) + 1
    }
    const duplicates = Object.entries(slugCounts).filter(([_, c]) => c > 1)
    if (duplicates.length > 0) {
      console.log(`\n🔁 重复 slug (${duplicates.length} 个):`)
      for (const [slug, count] of duplicates.slice(0, 20)) {
        console.log(`   ${slug}: ${count} 条记录`)
      }
    }
  }

  // 9. accessLevel 分布
  console.log(`\n🔓 按 accessLevel 分布:`)
  const { data: accessData } = await supabase.from('Article').select('accessLevel')
  if (accessData) {
    const accessCounts: Record<string, number> = {}
    for (const r of accessData) {
      const level = (r.accessLevel as string) || '(null)'
      accessCounts[level] = (accessCounts[level] || 0) + 1
    }
    for (const [level, count] of Object.entries(accessCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${level}: ${count}`)
    }
  }

  // 10. qualityScore 为 null 的已发布文章
  const { count: publishedNoScore } = await supabase
    .from('Article')
    .select('*', { count: 'exact', head: true })
    .eq('isPublished', true)
    .is('qualityScore', null)
  console.log(`\n❓ 已发布但 qualityScore 为 null: ${publishedNoScore}`)
}
main()
