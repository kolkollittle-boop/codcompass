// automation/crawler/src/article-restructurer.ts
/**
 * 文章重构器（版权安全版）：将爬取的原始文章转换为 Codcompass 2.0 标准结构
 *
 * 核心原则：
 * - 技术思想不受版权保护，但表达方式受保护
 * - 提取技术事实 → 全新标题、全新结构、全新代码 → 独立原创文章
 * - 保留 Production Bundle（本站特色）
 * - 过滤推广内容（newsletter, GitHub star, buy me coffee 等）
 *
 * v3 (2026-05-08):
 * - 从"格式重组"改为"深度重写"（版权安全）
 * - 全新标题、全新结构、全新代码示例
 * - 保留技术事实的准确性
 * - 增加 Production Bundle（Checklist + Decision Matrix + Config Template）
 * - 过滤所有推广内容
 */

const RESTRUCTURE_MAX_RETRIES = 3;
const RESTRUCTURE_TIMEOUT_MS = 120000; // 120s timeout per API call (long articles need more time)

interface RestructureResult {
  title: string;
  excerpt: string;
  content: string;
  difficultyLevel: string;
  tags: string[];
  readingTimeMinutes: number;
  expectedOutcome: string;
  // GEO (Generative Engine Optimization)
  seoTitle: string;
  seoDescription: string;
  geoKeywords: string[];
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 版权安全重构：深度重写原文为 Codcompass 2.0 标准文章
 *
 * 与旧版的区别：
 * - 旧版：保留原标题，按 5 段模板重组内容，代码原样复制 → 衍生作品风险
 * - 新版：提取技术事实，用全新标题/结构/代码重新表达 → 独立原创作品
 *
 * Fix v3 (2026-05-08):
 * - 深度重写 prompt（非格式重组）
 * - 要求 AI 生成全新标题、结构、代码示例
 * - 保留技术事实准确性（模型名、价格、数据等）
 * - 过滤所有推广内容
 * - Production Bundle 必须包含 Checklist + Decision Matrix + Config Template
 */
export async function restructureArticle(
  originalTitle: string,
  originalContent: string,
  evaluation: any
): Promise<RestructureResult> {
  const fallbackResult = createFallbackResult(originalTitle, originalContent, evaluation);

  const systemPrompt = `You are a senior technical editor and author for Codcompass, a premium developer knowledge base.

Your task: Read the source article below and write a COMPLETELY NEW, ORIGINAL technical article.

═══════════════════════════════════════════════════
 CRITICAL: COPYRIGHT-SAFE REWRITING RULES
═══════════════════════════════════════════════════

1. **NEW TITLE**: Must be completely different from the original. Never reuse the original title or a close variant.

2. **NEW STRUCTURE**: Do NOT follow the original's narrative order. Extract the technical concepts and rebuild from scratch using the Codcompass 2.0 structure below.

3. **YOUR OWN WORDS**: Do NOT paraphrase sentence by sentence. Start from the technical concept and explain it fresh, as if you're teaching the topic to a colleague.

4. **NEW CODE EXAMPLES**: Rewrite all code examples with different interface names, variable names, and structure. The functionality should be equivalent but the implementation must look different.

5. **NO SENTENCE COPYING**: If you find yourself writing something close to the original, stop and rephrase it from a different angle.

6. **PRESERVE TECHNICAL ACCURACY**: Model names, API names, pricing data, and technical facts must remain correct.

7. **ADD ORIGINAL VALUE**: Include best practices, extended insights, common mistakes, or production tips that were NOT in the original article. Make the rewritten version more valuable than the source.

8. **NO PROMOTIONAL CONTENT**: Remove all GitHub repo links, newsletter signups, "follow me on Twitter", "buy me a coffee", course sales, affiliate links, self-promotion, or calls-to-action.

═══════════════════════════════════════════════════
 CODCOMPASS 2.0 ARTICLE STRUCTURE (mandatory)
═══════════════════════════════════════════════════

## Current Situation Analysis
- The industry pain point this topic addresses
- Why this problem is overlooked or misunderstood
- Data-backed evidence (use facts from the source)

## WOW Moment: Key Findings
- A data comparison table showing the key insight
- Why this finding matters and what it enables

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [Option A] | [data] | [data] | [data] |
| [Option B] | [data] | [data] | [data] |

## Core Solution
- Step-by-step technical implementation
- NEW code examples (TypeScript unless topic requires otherwise)
- Architecture decisions and rationale
- Explain WHY each choice was made

## Pitfall Guide
- 5-7 common mistakes with detailed explanations
- Best practices derived from real production experience
- Each pitfall should have: name, explanation, and fix

## Production Bundle (MUST include all 4 subsections)
This is Codcompass's signature section — it must be practical and actionable.

### Action Checklist
- 5-8 actionable checklist items
- Format: "- [ ] Step name: brief explanation"

### Decision Matrix
- A comparison table to help readers choose
- When to use X vs Y, cost comparisons, trade-off analysis

| Scenario | Recommended Approach | Why | Cost Impact |
|----------|---------------------|-----|-------------|
| [Case A] | [Approach] | [Reason] | [Impact] |

### Configuration Template
- Ready-to-copy configuration or code template
- Properly formatted code block

### Quick Start Guide
- 3-5 steps to get running in under 5 minutes

═══════════════════════════════════════════════════
 OUTPUT FORMAT
═══════════════════════════════════════════════════

- Markdown format
- English language
- Keep technical terms as-is (model names, APIs, protocols)
- 2000-4000 words
- Professional, direct tone — like a senior engineer explaining to a peer
- No fluff, no filler, no "In today's world" intros

`;

  // Use larger content window for better context
  const contentWindow = originalContent.substring(0, 12000);

  for (let attempt = 1; attempt <= RESTRUCTURE_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        const backoffMs = 2000 * Math.pow(2, attempt - 1);
        console.log(`  🔄 Restructure retry ${attempt}/${RESTRUCTURE_MAX_RETRIES}, waiting ${backoffMs}ms...`);
        await sleep(backoffMs);
      }

      const response = await fetchWithTimeout(
        'https://coding.dashscope.aliyuncs.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'qwen3.5-plus',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Write a completely new, original technical article based on the following source material.

Original article title (for reference only — DO NOT reuse it):
"${originalTitle}"

Source content (extract technical facts, rewrite everything else):
${contentWindow}`,
              },
            ],
            max_tokens: 8000,
            temperature: 0.3,
          }),
        },
        RESTRUCTURE_TIMEOUT_MS,
      );

      if (!response.ok) {
        const status = response.status;
        const bodyText = await response.text().catch(() => '');

        if (status === 429) {
          console.warn(`  ⚠️ Restructure rate limited (429), attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
          if (attempt < RESTRUCTURE_MAX_RETRIES) continue;
          console.warn(`  ❌ Restructure failed after ${RESTRUCTURE_MAX_RETRIES} retries: rate limited`);
          return fallbackResult;
        }

        if (status >= 500) {
          console.warn(`  ⚠️ Restructure server error (${status}), attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
          if (attempt < RESTRUCTURE_MAX_RETRIES) continue;
          console.warn(`  ❌ Restructure failed after ${RESTRUCTURE_MAX_RETRIES} retries: ${status}`);
          return fallbackResult;
        }

        // Other errors (4xx) - don't retry
        console.warn(`  ❌ Restructure API error: ${status} ${bodyText.slice(0, 200)}`);
        return fallbackResult;
      }

      const data = await response.json();
      const restructuredContent = data.choices?.[0]?.message?.content;

      if (!restructuredContent || restructuredContent.trim().length < 100) {
        console.warn(`  ⚠️ Restructure returned empty/too short content, attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
        if (attempt < RESTRUCTURE_MAX_RETRIES) continue;
        return fallbackResult;
      }

      // Validate that the output has the expected Codcompass 2.0 structure
      const hasStructure = restructuredContent.includes('Current Situation') ||
                           restructuredContent.includes('WOW Moment') ||
                           restructuredContent.includes('Core Solution') ||
                           restructuredContent.includes('Pitfall') ||
                           restructuredContent.includes('Production Bundle');

      if (!hasStructure) {
        console.warn(`  ⚠️ Restructure output missing expected sections, attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
        if (attempt < RESTRUCTURE_MAX_RETRIES) continue;
        // Still use it if it's long enough — the AI may have used slightly different headings
        if (restructuredContent.length > 500) {
          console.log(`  ⚠️ Using restructured content despite missing standard headings (length: ${restructuredContent.length})`);
        } else {
          return fallbackResult;
        }
      }

      // Success
      return buildRestructureResult(originalTitle, originalContent, restructuredContent, evaluation);

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isAbort = msg.includes('abort') || msg.includes('timed out') || msg.includes('AbortError');

      if (isAbort) {
        console.warn(`  ⚠️ Restructure request timed out (${RESTRUCTURE_TIMEOUT_MS}ms), attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
      } else {
        console.warn(`  ⚠️ Restructure network error: ${msg.slice(0, 150)}, attempt ${attempt}/${RESTRUCTURE_MAX_RETRIES}`);
      }

      if (attempt >= RESTRUCTURE_MAX_RETRIES) {
        console.warn(`  ❌ Restructure failed after ${RESTRUCTURE_MAX_RETRIES} retries`);
        return fallbackResult;
      }
    }
  }

  return fallbackResult;
}

function buildRestructureResult(
  originalTitle: string,
  originalContent: string,
  restructuredContent: string,
  evaluation: any,
): RestructureResult {
  // Extract title from restructured content (first # heading)
  const titleMatch = restructuredContent.match(/^#\s+(.+)$/m);
  const extractedTitle = titleMatch ? titleMatch[1].trim() : originalTitle;

  return {
    title: extractedTitle,
    excerpt: generateExcerpt(restructuredContent),
    content: restructuredContent,
    difficultyLevel: evaluation.difficulty_level || 'L2',
    tags: extractTags(restructuredContent, extractedTitle),
    readingTimeMinutes: Math.ceil(restructuredContent.length / 1000 * 5),
    expectedOutcome: extractExpectedOutcome(restructuredContent),
    // GEO fields
    seoTitle: generateSeoTitle(extractedTitle),
    seoDescription: generateSeoDescription(restructuredContent, extractedTitle),
    geoKeywords: generateGeoKeywords(restructuredContent, extractedTitle),
  };
}

function createFallbackResult(
  originalTitle: string,
  originalContent: string,
  evaluation: any,
): RestructureResult {
  return {
    title: originalTitle,
    excerpt: generateExcerpt(originalContent),
    content: originalContent,
    difficultyLevel: evaluation.difficulty_level || 'L2',
    tags: extractTags(originalContent, originalTitle),
    readingTimeMinutes: Math.ceil(originalContent.length / 1000 * 5),
    expectedOutcome: '',
    seoTitle: generateSeoTitle(originalTitle),
    seoDescription: generateSeoDescription(originalContent, originalTitle),
    geoKeywords: generateGeoKeywords(originalContent, originalTitle),
  };
}

/**
 * 提取预期收益 — English-only patterns
 */
function extractExpectedOutcome(content: string): string {
  const patterns = [
    /reduce[^\n]{5,80}/gi,
    /improve[^\n]{5,80}/gi,
    /increase[^\n]{5,80}/gi,
    /accelerate[^\n]{5,80}/gi,
    /eliminate[^\n]{5,80}/gi,
    /optimize[^\n]{5,80}/gi,
    /streamline[^\n]{5,80}/gi,
    /save[^\n]{5,80}/gi,
    /boost[^\n]{5,80}/gi,
    /faster[^\n]{5,80}/gi,
    /lower[^\n]{5,80}/gi,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      return match[0].substring(0, 120);
    }
  }

  return '';
}

/** 博客入库用：保留原文，仅做摘要 / 标签（不调用重构模型） */
export function extractTags(content: string, title: string): string[] {
  const techKeywords = [
    'RAG', 'Agent', 'LLM', 'Vector DB', 'Embedding', 'Re-ranking',
    'React', 'Next.js', 'TypeScript', 'Python', 'Docker', 'Kubernetes',
    'API', 'Microservices', 'Serverless', 'CI/CD',
    'AI', 'Machine Learning', 'Deep Learning', 'Rust', 'Function',
  ];

  const tags: string[] = [];
  const text = `${title} ${content.substring(0, 2000)}`.toUpperCase();

  for (const keyword of techKeywords) {
    if (text.includes(keyword.toUpperCase()) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
    if (tags.length >= 5) break;
  }

  return tags;
}

/** 博客摘录：基于英文正文截断，避免依赖重构模型 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  // 移除 Markdown 标记
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // 在句子边界截断
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
  );

  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}

// ============================================================
// GEO (Generative Engine Optimization) helpers
// ============================================================

/**
 * Generate SEO-optimized title for search engines and AI crawlers
 */
export function generateSeoTitle(title: string): string {
  // Remove leading markdown heading markers
  const clean = title.replace(/^#\s+/, '').trim();
  // Ensure it's under 60 chars (Google title display limit)
  if (clean.length <= 60) return clean;
  // Truncate at word boundary
  const truncated = clean.substring(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Generate SEO description (150-160 chars optimal for Google snippet)
 */
export function generateSeoDescription(content: string, title: string): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\|[^|]+\|/g, '') // Remove table rows
    .replace(/-\s\[\s?\]/g, '') // Remove checkbox lines
    .trim();

  // Take first meaningful paragraph
  const paragraphs = plainText.split('\n\n').filter(p => p.trim().length > 50);
  const firstPara = paragraphs[0] || plainText;

  // Extract first sentence that mentions key tech
  const sentences = firstPara.split(/[.!?]+/).filter(s => s.trim().length > 20);

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (s.length >= 80 && s.length <= 160) {
      return s + '.';
    }
    if (s.length > 160) {
      return s.substring(0, 157) + '...';
    }
  }

  // Fallback: truncate the first paragraph
  const fallback = firstPara.substring(0, 157);
  const lastSpace = fallback.lastIndexOf(' ');
  return (lastSpace > 80 ? fallback.substring(0, lastSpace) : fallback) + '...';
}

/**
 * Generate GEO keywords for AI engine indexing
 */
export function generateGeoKeywords(content: string, title: string): string[] {
  // Extended keyword list for GEO
  const geoKeywords = [
    // Frameworks & Languages
    'Next.js', 'Next.js 15', 'Next.js 14', 'React', 'TypeScript', 'JavaScript',
    'Python', 'Rust', 'Go', 'Node.js', 'Deno', 'Bun',
    // AI & ML
    'AI', 'Machine Learning', 'LLM', 'GPT', 'Claude', 'RAG',
    'Vector Database', 'Embeddings', 'Prompt Engineering', 'Fine-tuning',
    // Backend & Database
    'Supabase', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
    'Prisma', 'Drizzle ORM', 'tRPC', 'FastAPI', 'Express',
    // DevOps & Cloud
    'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Cloudflare', 'CI/CD',
    'GitHub Actions', 'Terraform', 'Serverless', 'Microservices',
    // Frontend
    'Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'Zustand', 'Redux',
    'React Query', 'TanStack', 'SWR',
    // Best Practices
    'Best Practices', 'Tutorial', 'Guide', 'How To', 'Production Ready',
    'Code Examples', 'Architecture', 'Design Patterns', 'Performance',
    'Security', 'Authentication', 'Deployment', 'Testing',
  ];

  const text = `${title} ${content.substring(0, 5000)}`.toUpperCase();
  const keywords: string[] = [];

  for (const keyword of geoKeywords) {
    if (text.includes(keyword.toUpperCase()) && !keywords.includes(keyword)) {
      keywords.push(keyword);
    }
    if (keywords.length >= 15) break;
  }

  return keywords;
}
