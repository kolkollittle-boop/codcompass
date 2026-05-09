/**
 * 知识库分类爬虫：根据各分类的目标数量，智能选择文章路由。
 *
 * 工作流程：
 * 1. 从线上 API 获取各分类的已发布文章数量
 * 2. 计算每个分类还需要多少篇文章
 * 3. 在 AI 路由时，优先选择缺口最大的分类
 * 4. 当所有分类都达到目标数量时停止
 */

import { readCrawlerUiConfig } from './crawler-ui-config';

/** KB 分类列表（与 lib/cc20-kb-taxonomy.ts 对齐） */
const KB_SECTIONS: Array<{ slug: string; name: string }> = [
  { slug: 'cc20-1-1-ai-agent-development', name: 'AI Agents & Orchestration' },
  { slug: 'cc20-1-2-enterprise-rag', name: 'Enterprise RAG & Knowledge Engines' },
  { slug: 'cc20-1-3-local-llm', name: 'Local LLM Deployment & Optimization' },
  { slug: 'cc20-1-4-ai-productization', name: 'AI Productionization & Commercialization' },
  { slug: 'cc20-2-1-architecture-transformation', name: 'Architecture Modernization & Transformation' },
  { slug: 'cc20-2-scalable-backend-systems', name: 'Scalable Backend Systems' },
  { slug: 'cc20-2-4-devops-iac', name: 'DevOps & Infrastructure as Code' },
  { slug: 'cc20-3-3-one-person-os', name: 'One-Person Business Operating System' },
  { slug: 'cc20-3-1-digital-asset-matrix', name: 'Automated Product Delivery' },
  { slug: 'cc20-3-2-growth-traffic', name: 'Digital Operations Automation' },
  { slug: 'cc20-4-1-tools-efficiency', name: 'Productivity & Workflow Engineering' },
  { slug: 'cc20-4-2-code-quality', name: 'Systematic Learning & Methodology' },
  { slug: 'cc20-4-3-reusable-components', name: 'Cognitive & Architectural Thinking' },
  { slug: 'cc20-cross-security-compliance', name: 'Security & Compliance' },
  { slug: 'cc20-cross-cost-sustainability', name: 'Cost Engineering & Sustainability' },
  { slug: 'cc20-cross-observability', name: 'Observability & Intelligent Monitoring' },
  { slug: 'cc20-5-2-book-notes', name: 'Book Reviews' },
  { slug: 'cc20-5-deep-dives', name: 'Deep Dives' },
  { slug: 'cc20-insights-research-notes', name: 'Research Notes' },
  { slug: 'cc20-archive', name: 'Archive' },
  { slug: 'cc20-references', name: 'References' },
];

export type CategoryGapInfo = {
  slug: string;
  name: string;
  currentCount: number;
  targetCount: number;
  gap: number;  // 还需要多少篇
};

export type CategoryStatsResponse = {
  success: boolean;
  categories: Array<{
    slug: string;
    name: string;
    nameEn: string;
    publishedCount: number;
    totalWithStatus: number;
  }>;
  uncategorizedPublished: number;
  timestamp: string;
};

/**
 * 从线上 API 获取各分类的文章统计
 */
export async function fetchCategoryStats(
  ingestBaseUrl: string,
  secret: string
): Promise<CategoryStatsResponse | null> {
  try {
    const baseUrl = ingestBaseUrl || 'https://www.codcompass.com';
    const res = await fetch(`${baseUrl}/api/local-only/category-stats`, {
      headers: {
        'x-ingest-secret': secret,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[category-stats] API 返回 ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data as CategoryStatsResponse;
  } catch (e) {
    console.warn('[category-stats] 获取失败:', e);
    return null;
  }
}

/**
 * 计算各分类的缺口
 */
export function calculateCategoryGaps(
  stats: CategoryStatsResponse | null,
  targets: Record<string, number>
): CategoryGapInfo[] {
  const gaps: CategoryGapInfo[] = [];

  // 遍历所有 KB 分类
  for (const section of KB_SECTIONS) {
    const target = targets[section.slug] || 0;
    if (target <= 0) continue;  // 没有设置目标或目标为 0

    const currentCount = stats?.categories?.find(c => c.slug === section.slug)?.publishedCount || 0;
    const gap = Math.max(0, target - currentCount);

    gaps.push({
      slug: section.slug,
      name: section.name,
      currentCount,
      targetCount: target,
      gap,
    });
  }

  // 按缺口从大到小排序
  gaps.sort((a, b) => b.gap - a.gap);

  return gaps;
}

/**
 * 检查是否所有分类都已达标
 */
export function allCategoriesFilled(gaps: CategoryGapInfo[]): boolean {
  return gaps.every(g => g.gap <= 0);
}

/**
 * 获取当前最需要填充的分类 slug
 */
export function getMostNeededCategory(gaps: CategoryGapInfo[]): string | null {
  if (gaps.length === 0) return null;
  const top = gaps[0];
  return top.gap > 0 ? top.slug : null;
}

/**
 * 获取分类爬虫的运行摘要
 */
export function getCategoryCrawlerSummary(gaps: CategoryGapInfo[]): string {
  const totalTarget = gaps.reduce((sum, g) => sum + g.targetCount, 0);
  const totalCurrent = gaps.reduce((sum, g) => sum + g.currentCount, 0);
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const filledCount = gaps.filter(g => g.gap <= 0).length;

  return `📊 分类爬虫摘要: ${filledCount}/${gaps.length} 分类已达标, ` +
    `总计 ${totalCurrent}/${totalTarget} 篇, 还需 ${totalGap} 篇`;
}

/**
 * 打印各分类的缺口信息
 */
export function printCategoryGaps(gaps: CategoryGapInfo[]): void {
  console.log('\n📋 各分类文章数量缺口:');
  for (const g of gaps) {
    const status = g.gap <= 0 ? '✅' : `⏳ 还需 ${g.gap} 篇`;
    console.log(`  ${g.name} (${g.slug}): ${g.currentCount}/${g.targetCount} ${status}`);
  }
  console.log('');
}
