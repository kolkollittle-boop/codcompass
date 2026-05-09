/**
 * 本地爬虫控制台配置（/local-only + /api/local-only/*）
 * 实现放在本包内，避免 tsx 在子包（type: module）中跨目录 import 仓库根 `lib/` 时
 * Node 24 下出现 “does not provide an export named …” 的解析问题。
 *
 * 文件路径：automation/crawler/data/crawler-ui-config.json
 * 字段对齐：docs/…/6.爬虫面板及知识库推荐.md（调度、爬虫配置、数据源等）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export const DEFAULT_DEVTO_TAGS = [
  'javascript',
  'typescript',
  'react',
  'node',
  'python',
  'ai',
  'machinelearning',
];

export type CrawlerSourceType = 'devto' | 'rss' | 'custom';

/** 与知识库文档对齐的规划标签（Runner 当前仅消费 Dev.to） */
export type CrawlerContentTrack = 'kb' | 'blog' | 'ai';

export type CrawlerPriority = 'P0' | 'P1' | 'P2';

/** 文档「针对不同网站选择对应的提取模板」 */
export type CrawlerExtractTemplate =
  | 'none'
  | 'github_trending'
  | 'tech_blog'
  | 'generic_rss'
  | 'roadmap_nodes';

export type CrawlerSourceRow = {
  id: string;
  enabled: boolean;
  type: CrawlerSourceType;
  /** 展示名 */
  label: string;
  /** Dev.to：tag 列表；RSS：可留空；custom：备注 */
  tags: string[];
  /** RSS Feed URL（预留） */
  feedUrl?: string;
  /** 站点首页 / 列表备忘 URL */
  siteUrl?: string;
  articlesPerTag?: number;
  contentTrack?: CrawlerContentTrack;
  priority?: CrawlerPriority;
  /** 预期入库路径，如 KB / Systematic_Learning */
  expectedCategory?: string;
  /** 抓取策略备忘（文档「站点规则模版」） */
  crawlStrategy?: string;
  extractTemplate?: CrawlerExtractTemplate;
};

export type CrawlerScheduleIntervalUnit = 'minutes' | 'hours' | 'days';

export type CrawlerSchedule = {
  intervalUnit: CrawlerScheduleIntervalUnit;
  /** 与 intervalUnit 搭配：分钟 1–1440、小时 1–168、天 1–30 */
  intervalValue: number;
  /** 兼容旧 JSON；当 intervalUnit 为 hours 时会与 intervalValue 一致 */
  intervalHours?: number;
  cron: string;
  description: string;
};

export type CrawlerPanelAdvanced = {
  /** 本地并发任务数（run.ts 批内 Promise 并发） */
  maxConcurrency: number;
  /** 标题命中任一子串则跳过登记（不区分大小写） */
  keywordBlacklist: string[];
  /** 正文 Markdown 低于此长度则跳过加工（0 表示关闭） */
  minContentChars: number;
  /** 面板备忘，与 CRAWLER_SCORE_THRESHOLD 对齐说明用 */
  minAiScorePanel: number;
  /** 关键字监控（展示/备忘，逗号分隔存数组） */
  globalWatchKeywords: string[];
  /** 单次运行最多登记多少条 Dev.to 发现（0 表示不限制） */
  maxArticlesPerRun: number;
  ingestBaseUrlHint: string;
  llmRoutingModelHint: string;
  llmQualityModelHint: string;
};

export type CrawlerUiConfig = {
  version: number;
  schedule: CrawlerSchedule;
  advanced: CrawlerPanelAdvanced;
  sources: CrawlerSourceRow[];
  /** 知识库分类目标数量配置 */
  categoryTargets?: Record<string, number>;
  lastRun?: {
    at: string;
    exitCode: number | null;
    stdoutTail: string;
    stderrTail: string;
    /** 最近一次 API/终端触发 run 的耗时（毫秒） */
    durationMs?: number;
  };
};

/**
 * Next API 的 cwd 为仓库根；`npm run crawler:local` 的 cwd 为 automation/crawler。
 * 两种情况下必须指向同一文件：automation/crawler/data/crawler-ui-config.json
 */
export function getCrawlerUiConfigPath(): string {
  const cwd = process.cwd();
  const crawlerRun = join(cwd, 'src', 'run.ts');
  if (existsSync(crawlerRun)) {
    return join(cwd, 'data', 'crawler-ui-config.json');
  }
  return join(cwd, 'automation', 'crawler', 'data', 'crawler-ui-config.json');
}

export function clampIntervalHours(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 6;
  return Math.min(168, Math.max(1, Math.floor(v)));
}

export function clampScheduleValue(unit: CrawlerScheduleIntervalUnit, n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  const x = Number.isFinite(v) ? Math.floor(v) : 1;
  if (unit === 'minutes') return Math.min(1440, Math.max(1, x));
  if (unit === 'days') return Math.min(30, Math.max(1, x));
  return Math.min(168, Math.max(1, x));
}

/** 当单位为小时且整除 24 时生成常见 cron；否则返回每小时整点作参考 */
export function suggestCronFromIntervalHours(hours: number): string {
  const h = clampIntervalHours(hours);
  if (h === 1) return '0 * * * *';
  if (24 % h === 0) return `0 */${h} * * *`;
  return '0 * * * *';
}

function defaultAdvanced(): CrawlerPanelAdvanced {
  return {
    maxConcurrency: 2,
    keywordBlacklist: [],
    minContentChars: 0,
    minAiScorePanel: 80,
    globalWatchKeywords: [],
    maxArticlesPerRun: 200,
    ingestBaseUrlHint: '',
    llmRoutingModelHint: '',
    llmQualityModelHint: '',
  };
}

function parseStringArray(val: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => String(x).trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function normalizeAdvanced(raw: unknown): CrawlerPanelAdvanced {
  const d = defaultAdvanced();
  if (!raw || typeof raw !== 'object') return d;
  const o = raw as Record<string, unknown>;
  const mc = typeof o.maxConcurrency === 'number' ? Math.floor(o.maxConcurrency) : d.maxConcurrency;
  const minChars =
    typeof o.minContentChars === 'number' ? Math.floor(o.minContentChars) : d.minContentChars;
  const minScore =
    typeof o.minAiScorePanel === 'number' ? Math.floor(o.minAiScorePanel) : d.minAiScorePanel;
  const maxArt =
    typeof o.maxArticlesPerRun === 'number' ? Math.floor(o.maxArticlesPerRun) : d.maxArticlesPerRun;
  return {
    maxConcurrency: Math.min(8, Math.max(1, mc)),
    keywordBlacklist: parseStringArray(o.keywordBlacklist, 40, 120),
    minContentChars: Math.min(100_000, Math.max(0, minChars)),
    minAiScorePanel: Math.min(100, Math.max(0, minScore)),
    globalWatchKeywords: parseStringArray(o.globalWatchKeywords, 30, 80),
    maxArticlesPerRun: Math.min(2000, Math.max(0, maxArt)),
    ingestBaseUrlHint: o.ingestBaseUrlHint ? String(o.ingestBaseUrlHint).slice(0, 500) : '',
    llmRoutingModelHint: o.llmRoutingModelHint ? String(o.llmRoutingModelHint).slice(0, 120) : '',
    llmQualityModelHint: o.llmQualityModelHint ? String(o.llmQualityModelHint).slice(0, 120) : '',
  };
}

export function normalizeSchedule(raw: CrawlerUiConfig['schedule'] | undefined): CrawlerSchedule {
  const def = defaultCrawlerUiConfig().schedule;
  if (!raw || typeof raw !== 'object') return def;
  const r = raw as Record<string, unknown>;
  const intervalUnit: CrawlerScheduleIntervalUnit =
    r.intervalUnit === 'minutes' || r.intervalUnit === 'days' ? r.intervalUnit : 'hours';
  const rawVal =
    typeof r.intervalValue === 'number' && Number.isFinite(r.intervalValue)
      ? r.intervalValue
      : typeof r.intervalHours === 'number' && Number.isFinite(r.intervalHours)
        ? r.intervalHours
        : def.intervalValue;
  const intervalValue = clampScheduleValue(intervalUnit, rawVal);
  const cron =
    typeof raw.cron === 'string' && raw.cron.trim()
      ? String(raw.cron).slice(0, 80)
      : intervalUnit === 'hours'
        ? suggestCronFromIntervalHours(intervalValue)
        : '0 * * * *';
  const description =
    typeof raw.description === 'string' && raw.description.trim()
      ? String(raw.description).slice(0, 500)
      : def.description;
  return {
    intervalUnit,
    intervalValue,
    ...(intervalUnit === 'hours' ? { intervalHours: intervalValue } : {}),
    cron,
    description,
  };
}

export function defaultCrawlerUiConfig(): CrawlerUiConfig {
  const intervalUnit: CrawlerScheduleIntervalUnit = 'hours';
  const intervalValue = 6;
  return {
    version: 1,
    schedule: {
      intervalUnit,
      intervalValue,
      intervalHours: intervalValue,
      cron: suggestCronFromIntervalHours(intervalValue),
      description: `每 ${intervalValue} 小时：终端常驻运行 npm run crawler:schedule（或单次 npm run crawler:local）`,
    },
    advanced: defaultAdvanced(),
    sources: [
      {
        id: 'seed-devto-1',
        enabled: true,
        type: 'devto',
        label: 'Dev.to 默认',
        tags: [...DEFAULT_DEVTO_TAGS],
        articlesPerTag: 5,
        extractTemplate: 'tech_blog',
      },
    ],
  };
}

/** `crawler:schedule` 等待间隔（毫秒） */
export function getScheduleIntervalMs(): number {
  const s = readCrawlerUiConfig().schedule;
  const unit = s.intervalUnit ?? 'hours';
  const val = clampScheduleValue(
    unit,
    typeof s.intervalValue === 'number' ? s.intervalValue : s.intervalHours ?? 6
  );
  if (unit === 'minutes') return val * 60_000;
  if (unit === 'days') return val * 86_400_000;
  return val * 3_600_000;
}

export function readCrawlerUiConfig(): CrawlerUiConfig {
  const p = getCrawlerUiConfigPath();
  if (!existsSync(p)) {
    return defaultCrawlerUiConfig();
  }
  try {
    const raw = JSON.parse(readFileSync(p, 'utf-8')) as CrawlerUiConfig & { advanced?: unknown };
    if (!raw || !Array.isArray(raw.sources)) return defaultCrawlerUiConfig();
    return {
      ...defaultCrawlerUiConfig(),
      ...raw,
      schedule: normalizeSchedule(raw.schedule as CrawlerUiConfig['schedule'] | undefined),
      advanced: normalizeAdvanced(raw.advanced),
      sources: raw.sources,
    };
  } catch {
    return defaultCrawlerUiConfig();
  }
}

export function writeCrawlerUiConfig(config: CrawlerUiConfig): void {
  const p = getCrawlerUiConfigPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(config, null, 2), 'utf-8');
}

export function getCrawlerAdvancedForRun(): CrawlerPanelAdvanced {
  try {
    return readCrawlerUiConfig().advanced ?? defaultAdvanced();
  } catch {
    return defaultAdvanced();
  }
}

export function titleMatchesKeywordBlacklist(title: string, blacklist: string[]): boolean {
  if (!blacklist.length) return false;
  const t = title.toLowerCase();
  return blacklist.some((w) => {
    const s = w.trim().toLowerCase();
    return s.length > 0 && t.includes(s);
  });
}

/** 供 run.ts 拉取 Dev.to 标签与每 tag 条数 */
export function getDevtoFetchOptions(): { tags: string[]; articlesPerTag: number } {
  try {
    const c = readCrawlerUiConfig();
    const devto = c.sources.filter((s) => s.enabled && s.type === 'devto');
    const tagLists = devto.flatMap((s) => s.tags || []);
    const unique = [
      ...new Set(
        tagLists
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
    const perList = devto.map((s) => Math.min(30, Math.max(1, Number(s.articlesPerTag) || 5)));
    const articlesPerTag = perList.length ? Math.max(...perList) : 5;
    return {
      tags: unique.length > 0 ? unique : [...DEFAULT_DEVTO_TAGS],
      articlesPerTag,
    };
  } catch {
    return { tags: [...DEFAULT_DEVTO_TAGS], articlesPerTag: 5 };
  }
}

export function mergeLastRun(
  config: CrawlerUiConfig,
  last: CrawlerUiConfig['lastRun']
): CrawlerUiConfig {
  return { ...config, lastRun: last };
}
