import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()

  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 15,
    select: {
      id: true, slug: true, titleEn: true, contentEn: true,
      publishedAt: true, status: true, sourceSite: true, editedAt: true
    }
  })

  console.log('=== 最近 15 篇已发布文章抽查 ===\n')

  for (const a of articles) {
    const c = a.contentEn

    // 2.0 重构特征
    const markers = [
      { name: 'Codcompass 标记', test: c.includes('Codcompass') || c.includes('codcompass') },
      { name: '学习路径', test: c.includes('## 学习路径') || c.includes('Learning Path') },
      { name: '难度等级', test: c.includes('难度等级') || c.includes('Difficulty') },
      { name: '核心概念', test: c.includes('核心概念') || c.includes('Key Concepts') },
      { name: '实践项目', test: c.includes('实践项目') || c.includes('Hands-on') },
      { name: '学习收获', test: c.includes('学习收获') || c.includes('What You\'ll Learn') },
      { name: 'HTML注释结构', test: c.includes('<!-- codcompass') || c.includes('<!-- structure') },
      { name: '来源标注', test: c.includes('本文来源') || c.includes('Source:') || c.includes('Adapted from') },
    ]

    const hitCount = markers.filter(m => m.test).length
    const contentLen = c.length

    // 判断
    let verdict = '⚠️ 可疑'
    if (hitCount >= 3) verdict = '✅ 已重构'
    else if (hitCount >= 1) verdict = '🟡 部分重构'
    else if (contentLen < 1500) verdict = '❌ 原文(太短)'
    else verdict = '❌ 疑似原文'

    console.log(`--- ${verdict} ---`)
    console.log(`标题: ${a.titleEn.substring(0, 100)}`)
    console.log(`Slug: ${a.slug}`)
    console.log(`发布: ${a.publishedAt?.toISOString().slice(0, 16) || 'unknown'}`)
    console.log(`编辑: ${a.editedAt?.toISOString().slice(0, 16) || 'never'}`)
    console.log(`来源: ${a.sourceSite || 'unknown'}`)
    console.log(`长度: ${contentLen} chars`)
    console.log(`特征命中: ${hitCount}/8`)
    for (const m of markers) {
      console.log(`  ${m.test ? '✅' : '❌'} ${m.name}`)
    }
    console.log()
  }

  await prisma.$disconnect()
}

main().catch(console.error)
