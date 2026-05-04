import OpenAI from 'openai';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(process.cwd(), '.env.local') });
dotenv.config({ path: join(process.cwd(), '..', '..', '.env.local') });

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return client;
}

export type SemanticRouteResult = {
  type: 'KB' | 'BLOG';
  kb_section_slug: string | null;
  blog_category_slug: string | null;
  reasoning: string;
  confidence: number;
  keywords: string[];
};

type TaxonomyFile = {
  kb_section_slugs: string[];
  blog_category_slugs: string[];
  kb_vault_hints?: string[];
};

function loadTaxonomy(): TaxonomyFile {
  const root = dirname(fileURLToPath(import.meta.url));
  const path = join(root, '..', 'taxonomy.json');
  return JSON.parse(readFileSync(path, 'utf-8')) as TaxonomyFile;
}

/**
 * 基于方案文档「语义路由」：KB vs BLOG + cc20 段落 slug 或博客分类 slug。
 */
export async function routeArticleSemantic(
  title: string,
  contentPreview: string
): Promise<SemanticRouteResult> {
  const { kb_section_slugs: kbSlugs, blog_category_slugs: blogSlugs, kb_vault_hints: hints = [] } =
    loadTaxonomy();

  const systemPrompt = `你是技术内容路由专家。根据正文意图在「知识库 KB」与「实践博客 BLOG」之间二选一，并给出分类。

KB 特征：长效知识、定义与原理、标准步骤或架构说明、客观第三人称、回答「是什么 / 标准怎么做」。
BLOG 特征：经验叙事、第一人称踩坑或版本升级记录、主观见解、回答「我在某场景下如何解决」。

规则：
- 选 KB 时，kb_section_slug 必须是下列之一（逐字完全匹配）：${kbSlugs.join(', ')}
- 选 BLOG 时，blog_category_slug 必须是下列之一：${blogSlugs.join(', ')}
- 若不确定类型：优先归入 KB，kb_section_slug 使用 cc20-archive
- keywords：3～5 个技术关键词（英文或小写短语）

vault 与 slug 对应提示（仅供选题，输出里仍只能使用上面的 kb_section_slug）：
${hints.join('\n')}

仅输出 JSON，不要 Markdown 代码块：
{
  "type": "KB" | "BLOG",
  "kb_section_slug": string | null,
  "blog_category_slug": string | null,
  "reasoning": string,
  "confidence": number,
  "keywords": string[]
}`;

  /** 方案 2.3：约前 1000 token 的节选（粗算 ~4 字符/token，含标题）。 */
  const approxChars = 1000 * 4;
  const preview = (`${title}\n\n` + contentPreview).slice(0, approxChars);

  try {
    const c = getClient();
    const completion = await c.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `标题：${title}\n\n正文节选：\n${preview}` },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = JSON.parse(completion.choices[0].message.content || '{}') as Record<string, unknown>;
    const type = raw.type === 'BLOG' ? 'BLOG' : 'KB';
    let kb_section_slug =
      typeof raw.kb_section_slug === 'string' ? raw.kb_section_slug : null;
    let blog_category_slug =
      typeof raw.blog_category_slug === 'string' ? raw.blog_category_slug : null;

    if (!kbSlugs.includes(kb_section_slug as string)) kb_section_slug = 'cc20-archive';
    if (type === 'BLOG') {
      kb_section_slug = null;
      if (!blogSlugs.includes(blog_category_slug as string)) blog_category_slug = 'typescript';
    } else {
      blog_category_slug = null;
    }

    const conf = typeof raw.confidence === 'number' ? raw.confidence : 0.5;
    const keywords = Array.isArray(raw.keywords)
      ? (raw.keywords as unknown[]).map(String).slice(0, 8)
      : [];

    return {
      type,
      kb_section_slug,
      blog_category_slug,
      reasoning: String(raw.reasoning || ''),
      confidence: conf,
      keywords,
    };
  } catch (e) {
    console.error('Semantic route failed:', e);
    return {
      type: 'KB',
      kb_section_slug: 'cc20-archive',
      blog_category_slug: null,
      reasoning: 'router_error_fallback',
      confidence: 0,
      keywords: [],
    };
  }
}
