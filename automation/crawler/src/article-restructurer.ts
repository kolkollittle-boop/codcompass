// automation/crawler/src/article-restructurer.ts
/**
 * 文章重构器：将爬取的原始文章转换为 Codcompass 2.0 标准结构
 * 
 * 标准结构：
 * 1. 现状分析（当前痛点、失效模式）
 * 2. WOW Moment（实验数据对比、甜点位发现）
 * 3. 核心方案（技术实现、代码示例）
 * 4. 避坑指南（常见错误、最佳实践）
 * 5. 交付物（Blueprint、Checklist、配置模板）
 */

interface RestructureResult {
  title: string;
  excerpt: string;
  content: string;
  difficultyLevel: string;
  tags: string[];
  readingTimeMinutes: number;
  expectedOutcome: string;
}

/**
 * 使用 AI 重构文章为标准结构
 */
export async function restructureArticle(
  originalTitle: string,
  originalContent: string,
  evaluation: any
): Promise<RestructureResult> {
  try {
    const response = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen3.5-plus',
        messages: [
          {
            role: 'system',
            content: `You are a senior technical editor. Restructure the English technical article into Codcompass 2.0 standard format.

Codcompass 2.0 Article Structure:
1. **Current Situation Analysis**: Pain points, failure modes, why traditional methods don't work
2. **WOW Moment**: Experimental data comparison table, key findings, sweet spot
3. **Core Solution**: Technical implementation details, code examples, architecture decisions
4. **Pitfall Guide**: 3-7 common mistakes and best practices
5. **Deliverables**: Downloadable Blueprint, Checklist, configuration templates

Requirements:
- Keep technical depth, do NOT simplify core content
- Add experimental data comparison table (if original doesn't have one, infer reasonable data based on technical knowledge)
- Extract 3-7 pitfall guides
- Keep code blocks intact, do NOT modify them
- **OUTPUT IN ENGLISH** (keep technical terms as-is)
- Keep Markdown format

Output format (strictly follow this template):

# [Article Title]

## Current Situation Analysis
[Pain points and failure mode analysis]

## WOW Moment: Key Findings
[Experimental data comparison table]

| Approach | Metric 1 | Metric 2 | Metric 3 |
|----------|----------|----------|----------|
| [Approach A] | [data] | [data] | [data] |
| [Approach B] | [data] | [data] | [data] |

## Core Solution
[Technical implementation and code examples]

## Pitfall Guide
1. **[Pitfall Name]**: [Detailed explanation]
2. **[Pitfall Name]**: [Detailed explanation]
...

## Deliverables
[Blueprint and Checklist description]`,
          },
          {
            role: 'user',
            content: `Please restructure the following article into Codcompass 2.0 standard format:

Title: ${originalTitle}

Original content:
${originalContent.substring(0, 8000)}`,
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.warn(`⚠️ Article restructure failed: ${response.status}`);
      return {
        title: originalTitle,
        excerpt: '',
        content: originalContent,
        difficultyLevel: evaluation.difficulty_level || 'L2',
        tags: [],
        readingTimeMinutes: Math.ceil(originalContent.length / 1000 * 5),
        expectedOutcome: '',
      };
    }

    const data = await response.json();
    const restructuredContent = data.choices?.[0]?.message?.content || originalContent;
    
    // 提取预期收益（从内容的前 200 字中提取）
    const expectedOutcome = extractExpectedOutcome(restructuredContent);
    
    // 提取标签
    const tags = extractTags(originalContent, originalTitle);
    
    // 计算阅读时间
    const readingTimeMinutes = Math.ceil(restructuredContent.length / 1000 * 5);

    return {
      title: originalTitle,
      excerpt: generateExcerpt(restructuredContent),
      content: restructuredContent,
      difficultyLevel: evaluation.difficulty_level || 'L2',
      tags,
      readingTimeMinutes,
      expectedOutcome,
    };
  } catch (error) {
    console.error(`❌ Article restructure error:`, error);
    return {
      title: originalTitle,
      excerpt: '',
      content: originalContent,
      difficultyLevel: evaluation.difficulty_level || 'L2',
      tags: [],
      readingTimeMinutes: Math.ceil(originalContent.length / 1000 * 5),
      expectedOutcome: '',
    };
  }
}

/**
 * 提取预期收益
 */
function extractExpectedOutcome(content: string): string {
  // 尝试从内容中提取关键收益描述
  const patterns = [
    /帮你[将把提降升][^\n]{10,50}/g,
    /提升[^\n]{5,30}/g,
    /降低[^\n]{5,30}/g,
    /减少[^\n]{5,30}/g,
    /reduce[^\n]{5,50}/gi,
    /improve[^\n]{5,50}/gi,
    /increase[^\n]{5,50}/gi,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      return match[0].substring(0, 100);
    }
  }

  return '';
}

/**
 * 提取标签
 */
function extractTags(content: string, title: string): string[] {
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

/**
 * 生成摘要
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  // 移除 Markdown 标记
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '[代码]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // 在句子边界截断
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('？')
  );

  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}
