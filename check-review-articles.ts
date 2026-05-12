import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 拉取所有 REVIEW 状态的文章...\n')

  const { data: articles, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, descriptionEn, sourceSite, status, isPublished, qualityScore, createdAt, originalUrl')
    .eq('status', 'REVIEW')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('❌ 查询失败:', error.message)
    process.exit(1)
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️ 没有找到 REVIEW 状态的文章')
    return
  }

  console.log(`📊 REVIEW 状态文章总数: ${articles.length}\n`)

  const withContent: any[] = []
  const withoutContent: any[] = []

  for (const a of articles) {
    if (a.contentEn && a.contentEn.length > 100) {
      withContent.push(a)
    } else {
      withoutContent.push(a)
    }
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log('📝 有内容的 REVIEW 文章（可评估重构）')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`共 ${withContent.length} 篇\n`)

  for (let i = 0; i < withContent.length; i++) {
    const a = withContent[i]
    const contentPreview = a.contentEn!.slice(0, 300).replace(/\n/g, ' ')
    const contentLen = a.contentEn!.length
    const desc = a.descriptionEn || '(无描述)'
    const source = a.sourceSite || a.originalUrl || 'unknown'

    console.log(`${i+1}. ${a.titleEn?.slice(0,90) || '(无标题)'}`)
    console.log(`   slug: ${a.slug}`)
    console.log(`   source: ${source}`)
    console.log(`   content length: ${contentLen} chars | qualityScore: ${a.qualityScore ?? 'N/A'}`)
    console.log(`   created: ${a.createdAt}`)
    console.log(`   description: ${desc.slice(0, 120)}`)
    console.log(`   preview: ${contentPreview}...`)
    console.log('')
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log('⚠️  无内容或内容极短的 REVIEW 文章（需重新爬取或丢弃）')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`共 ${withoutContent.length} 篇\n`)

  for (const a of withoutContent) {
    const contentLen = a.contentEn?.length || 0
    console.log(`- ${a.titleEn?.slice(0,90) || '(无标题)'} [${contentLen} chars]`)
    console.log(`  slug: ${a.slug} | source: ${a.sourceSite || a.originalUrl || 'unknown'}`)
    console.log('')
  }
}
main()
