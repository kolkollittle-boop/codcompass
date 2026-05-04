/**
 * 爬虫面板：知识库 / 博客 / AI 推荐源与站点规则模版
 * 对齐 docs/Codcompass 爬虫系统 2.0 优化方案/6.爬虫面板及知识库推荐.md
 * 无 Node 专属依赖，可供 Client Component 引用。
 */

export type ContentTrack = 'kb' | 'blog' | 'ai';

/** 文档 L111–117：侧栏导航锚点 */
export const PANEL_NAV_LINKS = [
  { href: '#overview', label: '仪表盘' },
  { href: '#scheduling', label: '任务调度' },
  { href: '#crawler-config', label: '爬虫配置' },
  { href: '#sources', label: '数据源' },
  { href: '#jobs-audit', label: '执行与审计' },
  { href: '#analytics', label: '运维备忘' },
  { href: '#first-batch', label: '第一批目标站' },
  { href: '#reference', label: '扩展参考源' },
] as const;

/** 文档 L121–129：推荐的第一批抓取目标 */
export const FIRST_BATCH_TARGET_ROWS: {
  site: string;
  contentKind: string;
  category: string;
}[] = [
  { site: 'Roadmap.sh', contentKind: '结构化教材', category: 'KB / Systematic_Learning' },
  { site: 'Refactoring.Guru', contentKind: '架构/模式', category: 'KB / Architecture_Modernization' },
  { site: 'Anthropic Cookbook', contentKind: 'AI 实践指南', category: 'KB / Agentic_Systems' },
  { site: 'Vercel Blog', contentKind: '经验/心得', category: 'Blog / Next.js' },
  { site: 'InfoQ 架构专栏', contentKind: '深度实践', category: 'Blog / DevOps' },
];

/** 提取模板下拉文案（文档「针对不同网站选择对应的提取模板」） */
export const EXTRACT_TEMPLATE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: '未指定' },
  { value: 'github_trending', label: 'GitHub 热榜模板' },
  { value: 'tech_blog', label: '技术博客模板' },
  { value: 'generic_rss', label: '通用 RSS 模板' },
  { value: 'roadmap_nodes', label: 'Roadmap 节点模板' },
];

export type RefSite = {
  name: string;
  url: string;
  reason: string;
  track: ContentTrack;
};

/** §1 结构化知识库（KB）核心源 */
export const KB_REFERENCE_SITES: RefSite[] = [
  {
    name: 'Roadmap.sh',
    url: 'https://roadmap.sh',
    reason: '技术路径最全，路径节点可作知识库纲领。',
    track: 'kb',
  },
  {
    name: 'Refactoring.Guru',
    url: 'https://refactoring.guru',
    reason: '设计模式与重构图文教材，结构化高，贴合架构演进类。',
    track: 'kb',
  },
  {
    name: 'Microsoft Learn — Azure 架构指南',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/guide/',
    reason: '云架构框架、模式与反模式、最佳实践。',
    track: 'kb',
  },
  {
    name: 'Google Cloud Architecture Framework',
    url: 'https://cloud.google.com/architecture/framework',
    reason: '韧性、性能、安全，对应 System_Evolution 类内容。',
    track: 'kb',
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    reason: 'Web 基础参考与教程权威源。',
    track: 'kb',
  },
];

/** §2 博客与实践经验（Blog）核心源 */
export const BLOG_REFERENCE_SITES: RefSite[] = [
  {
    name: 'InfoQ',
    url: 'https://www.infoq.com',
    reason: '深度技术报道，架构与 AI 专栏质量高。',
    track: 'blog',
  },
  {
    name: 'The Pragmatic Engineer',
    url: 'https://blog.pragmaticengineer.com',
    reason: '大厂工程实践与系统架构深度文章。',
    track: 'blog',
  },
  {
    name: 'Vercel Blog',
    url: 'https://vercel.com/blog',
    reason: 'Next.js、React 与前端基础设施前沿。',
    track: 'blog',
  },
  {
    name: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com',
    reason: '安全、边缘计算与 DevOps 顶级实践。',
    track: 'blog',
  },
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com',
    reason: '分布式系统、可观测性与高可用经验。',
    track: 'blog',
  },
];

/** §3 AI Engineering 专项源 */
export const AI_REFERENCE_SITES: RefSite[] = [
  {
    name: 'Anthropic Cookbook',
    url: 'https://github.com/anthropics/anthropic-cookbook',
    reason: 'Claude 官方 Prompt 与 Agent 实现指南。',
    track: 'ai',
  },
  {
    name: 'LangChain Blog',
    url: 'https://blog.langchain.dev',
    reason: 'Agent 编排与 RAG 架构更新快。',
    track: 'ai',
  },
  {
    name: 'Prompt Engineering Guide',
    url: 'https://www.promptingguide.ai/zh',
    reason: '系统化提示词工程，含中文。',
    track: 'ai',
  },
];

/** 文档 §「站点规则模版」表格行 */
export const SITE_RULE_TEMPLATE_ROWS: {
  site: string;
  priority: 'P0' | 'P1' | 'P2';
  category: string;
  strategy: string;
}[] = [
  {
    site: 'Roadmap.sh',
    priority: 'P0',
    category: 'KB / Systematic_Learning',
    strategy: '抓取节点描述和推荐资源',
  },
  {
    site: 'Refactoring.Guru',
    priority: 'P1',
    category: 'KB / Architecture_Modernization',
    strategy: '提取设计模式的 UML 描述和代码',
  },
  {
    site: 'Vercel Blog',
    priority: 'P1',
    category: 'Blog / Next.js',
    strategy: '提取版本更新和最佳性能实践',
  },
  {
    site: 'Cloudflare',
    priority: 'P2',
    category: 'Blog / DevOps',
    strategy: '提取 Incident Report（事故报告）作为避坑指南',
  },
];

/** 一键插入「数据源」行的预设（Runner 当前仍以 Dev.to 为主；其余为规划备忘） */
export type SourcePreset = {
  id: string;
  label: string;
  type: 'devto' | 'rss' | 'custom';
  tags: string[];
  feedUrl?: string;
  siteUrl?: string;
  contentTrack: ContentTrack;
  priority: 'P0' | 'P1' | 'P2';
  expectedCategory: string;
  crawlStrategy: string;
  articlesPerTag?: number;
  defaultEnabled?: boolean;
  extractTemplate?: 'github_trending' | 'tech_blog' | 'generic_rss' | 'roadmap_nodes' | 'none';
};

export const SOURCE_PRESETS: SourcePreset[] = [
  {
    id: 'roadmap',
    label: 'Roadmap.sh',
    type: 'custom',
    tags: [],
    siteUrl: 'https://roadmap.sh',
    contentTrack: 'kb',
    priority: 'P0',
    expectedCategory: 'KB / Systematic_Learning',
    crawlStrategy: '抓取路径节点描述与推荐资源（待接管线）',
    extractTemplate: 'roadmap_nodes',
    defaultEnabled: false,
  },
  {
    id: 'refactoring-guru',
    label: 'Refactoring.Guru',
    type: 'custom',
    tags: [],
    siteUrl: 'https://refactoring.guru',
    contentTrack: 'kb',
    priority: 'P1',
    expectedCategory: 'KB / Architecture_Modernization',
    crawlStrategy: '提取设计模式 UML 与示例代码（待接管线）',
    extractTemplate: 'tech_blog',
    defaultEnabled: false,
  },
  {
    id: 'vercel-blog',
    label: 'Vercel Blog',
    type: 'custom',
    tags: [],
    siteUrl: 'https://vercel.com/blog',
    contentTrack: 'blog',
    priority: 'P1',
    expectedCategory: 'Blog / Next.js',
    crawlStrategy: 'RSS 或列表页解析；关注版本说明与性能实践（待接管线）',
    extractTemplate: 'tech_blog',
    defaultEnabled: false,
  },
  {
    id: 'cloudflare-blog',
    label: 'Cloudflare Blog',
    type: 'custom',
    tags: [],
    siteUrl: 'https://blog.cloudflare.com',
    contentTrack: 'blog',
    priority: 'P2',
    expectedCategory: 'Blog / DevOps',
    crawlStrategy: '优先 Incident / 事故复盘类文章（待接管线）',
    extractTemplate: 'tech_blog',
    defaultEnabled: false,
  },
  {
    id: 'anthropic-cookbook',
    label: 'Anthropic Cookbook',
    type: 'custom',
    tags: [],
    siteUrl: 'https://github.com/anthropics/anthropic-cookbook',
    contentTrack: 'ai',
    priority: 'P1',
    expectedCategory: 'KB / Agentic_Systems',
    crawlStrategy: '官方 Prompt / Agent 示例（待接管线）',
    extractTemplate: 'github_trending',
    defaultEnabled: false,
  },
  {
    id: 'infoq-architecture',
    label: 'InfoQ 架构专栏',
    type: 'custom',
    tags: [],
    siteUrl: 'https://www.infoq.com/architecture/',
    contentTrack: 'blog',
    priority: 'P1',
    expectedCategory: 'Blog / DevOps',
    crawlStrategy: '深度实践稿源，专栏列表或 RSS（待接管线）',
    extractTemplate: 'generic_rss',
    defaultEnabled: false,
  },
  {
    id: 'devto-default-bundle',
    label: 'Dev.to（默认 tag 包）',
    type: 'devto',
    tags: ['javascript', 'typescript', 'react', 'node', 'python', 'ai', 'machinelearning'],
    contentTrack: 'blog',
    priority: 'P1',
    expectedCategory: 'Blog / Dev.to 聚合',
    crawlStrategy: '官方 API 按 tag 拉取；当前 Runner 已支持',
    articlesPerTag: 5,
    extractTemplate: 'tech_blog',
    defaultEnabled: true,
  },
];
