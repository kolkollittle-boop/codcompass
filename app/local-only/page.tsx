'use client';

/**
 * 本地爬虫控制台：http://localhost:3000/local-only
 * 配置持久化：automation/crawler/data/crawler-ui-config.json
 * 对齐：docs/Codcompass 爬虫系统 2.0 优化方案/6.爬虫面板及知识库推荐.md（含 §66–129）
 */
import {
  AI_REFERENCE_SITES,
  BLOG_REFERENCE_SITES,
  EXTRACT_TEMPLATE_OPTIONS,
  FIRST_BATCH_TARGET_ROWS,
  KB_REFERENCE_SITES,
  SITE_RULE_TEMPLATE_ROWS,
  SOURCE_PRESETS,
  type RefSite,
} from '@/lib/crawler-panel-reference';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback, useEffect, useState } from 'react';

const tabTriggerClass =
  'rounded-md px-2.5 py-2 text-xs text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 data-[state=active]:shadow-none';

type CrawlerSourceType = 'devto' | 'rss' | 'custom';
type CrawlerContentTrack = 'kb' | 'blog' | 'ai';
type CrawlerPriority = 'P0' | 'P1' | 'P2';
type CrawlerScheduleUnit = 'minutes' | 'hours' | 'days';
type CrawlerExtractTemplate =
  | 'none'
  | 'github_trending'
  | 'tech_blog'
  | 'generic_rss'
  | 'roadmap_nodes';

type CrawlerSourceRow = {
  id: string;
  enabled: boolean;
  type: CrawlerSourceType;
  label: string;
  tags: string[];
  feedUrl?: string;
  siteUrl?: string;
  articlesPerTag?: number;
  contentTrack?: CrawlerContentTrack;
  priority?: CrawlerPriority;
  expectedCategory?: string;
  crawlStrategy?: string;
  extractTemplate?: CrawlerExtractTemplate;
};

type CrawlerPanelAdvanced = {
  maxConcurrency: number;
  keywordBlacklist: string[];
  minContentChars: number;
  minAiScorePanel: number;
  globalWatchKeywords: string[];
  maxArticlesPerRun: number;
  ingestBaseUrlHint: string;
  llmRoutingModelHint: string;
  llmQualityModelHint: string;
};

type CrawlerUiConfig = {
  version: number;
  schedule: {
    intervalUnit: CrawlerScheduleUnit;
    intervalValue: number;
    intervalHours?: number;
    cron: string;
    description: string;
  };
  advanced: CrawlerPanelAdvanced;
  sources: CrawlerSourceRow[];
  categoryTargets?: Record<string, number>;
  lastRun?: {
    at: string;
    exitCode: number | null;
    stdoutTail: string;
    stderrTail: string;
    durationMs?: number;
  };
};

function RefSitesBlock({
  title,
  accent,
  sites,
}: {
  title: string;
  accent: 'cyan' | 'violet' | 'amber';
  sites: RefSite[];
}) {
  const border =
    accent === 'cyan'
      ? 'border-l-cyan-600/70'
      : accent === 'violet'
        ? 'border-l-violet-600/70'
        : 'border-l-amber-600/70';
  return (
    <section
      className={`rounded-xl border border-neutral-800 border-l-4 ${border} bg-neutral-900/40 p-4 space-y-3`}
    >
      <h2 className="font-medium text-neutral-200">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sites.map((s) => (
          <li key={s.url} className="rounded-lg border border-neutral-800/80 bg-black/25 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-400/95 hover:text-teal-300 break-all"
              >
                {s.name}
              </a>
              <span className="shrink-0 rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                {s.track}
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">{s.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STORAGE_SECRET = 'local_crawler_ui_secret';

/** 默认 KB 分类列表（用于未加载统计数据时显示） */
const DEFAULT_KB_SECTIONS: Array<{ slug: string; name: string }> = [
  // AI 与机器学习
  { slug: 'ai-agents', name: 'AI Agents' },
  { slug: 'rag', name: 'RAG' },
  { slug: 'llm-fine-tuning', name: 'LLM Fine-tuning' },
  { slug: 'ml-ops', name: 'MLOps' },
  { slug: 'ai-safety', name: 'AI Safety' },
  // 前端开发
  { slug: 'frontend-architecture', name: 'Frontend Architecture' },
  { slug: 'react-patterns', name: 'React Patterns' },
  { slug: 'web-performance', name: 'Web Performance' },
  { slug: 'web-accessibility', name: 'Web Accessibility' },
  // 后端与基础设施
  { slug: 'backend-architecture', name: 'Backend Architecture' },
  { slug: 'api-design', name: 'API Design' },
  { slug: 'database-engineering', name: 'Database Engineering' },
  { slug: 'cloud-native', name: 'Cloud Native' },
  { slug: 'devops-sre', name: 'DevOps/SRE' },
  // 软件工程实践
  { slug: 'system-design', name: 'System Design' },
  { slug: 'testing-quality', name: 'Testing & Quality' },
  { slug: 'code-review', name: 'Code Review' },
  { slug: 'tech-debt', name: 'Tech Debt' },
  // 产品与商业
  { slug: 'tech-strategy', name: 'Tech Strategy' },
  { slug: 'product-management', name: 'Product Management' },
  { slug: 'startup-engineering', name: 'Startup Engineering' },
];

function headersWithSecret(secret: string): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret.trim()) h['x-local-crawler-secret'] = secret.trim();
  return h;
}

/** 与 `lib/crawler-ui-config` 中 suggestCronFromIntervalHours 一致（客户端不能 import 含 fs 的模块） */
type CrawlerRunHistoryRow = {
  startedAt: string;
  endedAt: string;
  siteLabel: string;
  discovered: number;
  processed: number;
  qualified: number;
  kbPushed: number;
  blogPushed: number;
  exitCode: number | null;
};

type CrawlLibraryRow = {
  syncLogId: number;
  taskId: string;
  url: string;
  source: string;
  taskStatus: string;
  score: number | null;
  syncStatus: string;
  note: string | null;
  title: string | null;
  routeType: string | null;
  createdAt: string;
};

function formatBeijingDateTime(iso: string): string {
  if (!iso) return '—';
  // SQLite datetime 格式: 'YYYY-MM-DD HH:MM:SS' (UTC)，需要添加 'Z' 后缀
  let normalized = iso;
  if (!iso.includes('T') && !iso.includes('Z') && !iso.includes('+')) {
    normalized = iso + 'Z';
  }
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

function suggestCronFromIntervalHoursClient(hours: number): string {
  const h = Math.min(168, Math.max(1, Math.floor(Number(hours) || 1)));
  if (h === 1) return '0 * * * *';
  if (24 % h === 0) return `0 */${h} * * *`;
  return '0 * * * *';
}

function clampScheduleValueClient(unit: CrawlerScheduleUnit, n: number): number {
  const x = Math.floor(Number(n)) || 1;
  if (unit === 'minutes') return Math.min(1440, Math.max(1, x));
  if (unit === 'days') return Math.min(30, Math.max(1, x));
  return Math.min(168, Math.max(1, x));
}

function getScheduleIntervalMsFromConfig(s: CrawlerUiConfig['schedule']): number {
  const unit = s.intervalUnit ?? 'hours';
  const val = clampScheduleValueClient(unit, s.intervalValue ?? s.intervalHours ?? 6);
  if (unit === 'minutes') return val * 60_000;
  if (unit === 'days') return val * 86_400_000;
  return val * 3_600_000;
}

function nextRunEstimateText(config: CrawlerUiConfig): string | null {
  if (!config.lastRun?.at) return null;
  const t = new Date(config.lastRun.at).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(t + getScheduleIntervalMsFromConfig(config.schedule)).toLocaleString('zh-CN', {
    hour12: false,
  });
}

export default function LocalCrawlerConsolePage() {
  const [secret, setSecret] = useState('');
  const [config, setConfig] = useState<CrawlerUiConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<{
    ok: boolean;
    exitCode: number | null;
    stdoutTail: string;
    stderrTail: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<CrawlerRunHistoryRow[]>([]);
  const [historyErr, setHistoryErr] = useState<string | null>(null);
  const [historyLimit, setHistoryLimit] = useState<5 | 10 | 20 | 30 | 50>(20);
  const [activeTab, setActiveTab] = useState('overview');
  const [libraryRows, setLibraryRows] = useState<CrawlLibraryRow[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryErr, setLibraryErr] = useState<string | null>(null);
  const [libraryQ, setLibraryQ] = useState('');
  const [libraryStatus, setLibraryStatus] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [crawlerMode, setCrawlerMode] = useState<'scheduled' | 'target' | 'category'>('scheduled');
  const [targetArticleCount, setTargetArticleCount] = useState(200);
  const [targetDistribution, setTargetDistribution] = useState<'even' | 'priority' | 'custom'>('even');
  const [categoryStats, setCategoryStats] = useState<Array<{
    slug: string;
    name: string;
    nameEn: string;
    publishedCount: number;
    totalWithStatus: number;
  }>>([]);
  const [categoryStatsLoading, setCategoryStatsLoading] = useState(false);
  const [categoryStatsErr, setCategoryStatsErr] = useState<string | null>(null);
  const [uniformCategoryTarget, setUniformCategoryTarget] = useState(20);
  const [crawlerRunning, setCrawlerRunning] = useState(false);
  const [crawlerStatus, setCrawlerStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [crawlerStatusMsg, setCrawlerStatusMsg] = useState('');
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);

  const loadRunHistory = useCallback(async () => {
    setHistoryErr(null);
    try {
      const r = await fetch(`/api/local-only/run-history?limit=${historyLimit}`, { cache: 'no-store' });
      if (!r.ok) {
        setHistoryErr(r.status === 404 ? '当前环境未开启本地控制台。' : `加载失败 ${r.status}`);
        return;
      }
      const j = await r.json();
      if (j?.ok && Array.isArray(j.rows)) setHistoryRows(j.rows as CrawlerRunHistoryRow[]);
      else setHistoryErr('响应格式异常');
    } catch {
      setHistoryErr('网络错误');
    }
  }, [historyLimit]);

  const loadLibrary = useCallback(async () => {
    setLibraryErr(null);
    setLibraryLoading(true);
    try {
      const p = new URLSearchParams();
      p.set('limit', '80');
      p.set('offset', '0');
      if (libraryQ.trim()) p.set('q', libraryQ.trim());
      if (libraryStatus.trim()) p.set('status', libraryStatus.trim());
      const r = await fetch(`/api/local-only/crawl-library?${p}`, { cache: 'no-store' });
      if (!r.ok) {
        setLibraryErr(r.status === 404 ? '当前环境未开启本地控制台。' : `加载失败 ${r.status}`);
        setLibraryRows([]);
        setLibraryTotal(0);
        return;
      }
      const j = await r.json();
      if (j?.ok && Array.isArray(j.rows)) {
        setLibraryRows(j.rows as CrawlLibraryRow[]);
        setLibraryTotal(typeof j.total === 'number' ? j.total : 0);
      } else {
        setLibraryErr('响应格式异常');
        setLibraryRows([]);
        setLibraryTotal(0);
      }
    } catch {
      setLibraryErr('网络错误');
      setLibraryRows([]);
      setLibraryTotal(0);
    } finally {
      setLibraryLoading(false);
    }
  }, [libraryQ, libraryStatus]);

  const refreshCrawlerLogs = useCallback(async () => {
    try {
      const r = await fetch('/api/local-only/config', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (j?.ok && j?.config?.lastRun) {
        const lastRun = j.config.lastRun;
        const logs: string[] = [];
        if (lastRun.stdoutTail) logs.push('[stdout]', lastRun.stdoutTail);
        if (lastRun.stderrTail) logs.push('[stderr]', lastRun.stderrTail);
        if (logs.length > 0) {
          setCrawlerLogs(logs);
          setCrawlerStatusMsg(`最后更新: ${formatBeijingDateTime(lastRun.at)}`);
        }
      }
    } catch {
      // ignore
    }
  }, []); // formatBeijingDateTime is a regular function, not a state dependency

  const loadCategoryStats = useCallback(async () => {
    setCategoryStatsErr(null);
    setCategoryStatsLoading(true);
    try {
      const headers: HeadersInit = {};
      if (secret) headers['x-local-crawler-secret'] = secret;
      const r = await fetch('/api/local-only/category-stats', { cache: 'no-store', headers });
      if (!r.ok) {
        setCategoryStatsErr(r.status === 401 ? '认证失败' : `加载失败 ${r.status}`);
        return;
      }
      const j = await r.json();
      if (j?.success && Array.isArray(j.categories)) {
        setCategoryStats(j.categories);
      } else {
        setCategoryStatsErr('响应格式异常');
      }
    } catch {
      setCategoryStatsErr('网络错误');
    } finally {
      setCategoryStatsLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    setSecret(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SECRET) ?? '' : '');
  }, []);

  // 爬虫运行时自动刷新日志
  useEffect(() => {
    if (!crawlerRunning) return;
    const interval = setInterval(() => {
      void refreshCrawlerLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [crawlerRunning, refreshCrawlerLogs]);

  const persistSecret = (v: string) => {
    setSecret(v);
    if (typeof window !== 'undefined') {
      if (v.trim()) localStorage.setItem(STORAGE_SECRET, v.trim());
      else localStorage.removeItem(STORAGE_SECRET);
    }
  };

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await fetch('/api/local-only/config', { cache: 'no-store' });
      if (!r.ok) {
        setLoadError(r.status === 404 ? '当前环境未开启本地控制台（仅 dev 或 ENABLE_LOCAL_CRAWLER_UI）。' : `加载失败 ${r.status}`);
        return;
      }
      const j = await r.json();
      if (j?.ok && j.config) setConfig(j.config as CrawlerUiConfig);
      else setLoadError('响应格式异常');
    } catch {
      setLoadError('网络错误');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (config) void loadRunHistory();
  }, [config, loadRunHistory]);

  useEffect(() => {
    if (!config || activeTab !== 'library') return;
    const delay = libraryQ.trim() ? 320 : 0;
    const id = window.setTimeout(() => void loadLibrary(), delay);
    return () => clearTimeout(id);
  }, [config, activeTab, libraryQ, libraryStatus, loadLibrary]);

  const save = async () => {
    if (!config) return;
    setSaveMsg(null);
    try {
      const r = await fetch('/api/local-only/config', {
        method: 'PUT',
        headers: headersWithSecret(secret),
        body: JSON.stringify({ config }),
      });
      const j = await r.json();
      if (!r.ok) {
        setSaveMsg(j?.error || `保存失败 ${r.status}`);
        return;
      }
      setSaveMsg('已保存');
      if (j.config) setConfig(j.config as CrawlerUiConfig);
    } catch {
      setSaveMsg('保存请求失败');
    }
  };

  const runCrawler = async () => {
    setRunning(true);
    setRunResult(null);
    setCrawlerRunning(true);
    setCrawlerStatus('running');
    setCrawlerStatusMsg('爬虫启动中...');
    try {
      const r = await fetch('/api/local-only/run', {
        method: 'POST',
        headers: headersWithSecret(secret),
      });
      const j = await r.json();
      setRunResult({
        ok: Boolean(j.ok),
        exitCode: j.exitCode ?? null,
        stdoutTail: String(j.stdoutTail ?? ''),
        stderrTail: String(j.stderrTail ?? ''),
      });
      if (j.ok) {
        setCrawlerStatus('completed');
        setCrawlerStatusMsg(`完成 - 退出码: ${j.exitCode ?? '未知'}`);
        // 更新日志
        if (j.stdoutTail) setCrawlerLogs(prev => [...prev, '[stdout]', j.stdoutTail]);
        if (j.stderrTail) setCrawlerLogs(prev => [...prev, '[stderr]', j.stderrTail]);
      } else {
        setCrawlerStatus('error');
        setCrawlerStatusMsg('执行失败');
      }
      await load();
      await loadRunHistory();
      await loadLibrary();
    } catch {
      setRunResult({
        ok: false,
        exitCode: null,
        stdoutTail: '',
        stderrTail: '请求失败（可能超时，请在终端执行 npm run crawler:local）',
      });
      setCrawlerStatus('error');
      setCrawlerStatusMsg('请求失败');
    } finally {
      setRunning(false);
      setCrawlerRunning(false);
    }
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cmd = 'npm run crawler:local';
  const scheduleCmd = 'npm run crawler:schedule';
  const dbPath = 'automation/crawler/data/crawler-state.sqlite';
  const crontabLine = config
    ? `${config.schedule.cron} cd /path/to/CyberPunkWeb && ${cmd} >> /tmp/crawler.log 2>&1`
    : '';

  const applyIntervalToCron = () => {
    if (!config) return;
    const unit = config.schedule.intervalUnit ?? 'hours';
    const v = clampScheduleValueClient(
      unit,
      config.schedule.intervalValue ?? config.schedule.intervalHours ?? 6
    );
    const cron = unit === 'hours' ? suggestCronFromIntervalHoursClient(v) : '0 * * * *';
    setConfig({
      ...config,
      schedule: {
        ...config.schedule,
        intervalUnit: unit,
        intervalValue: v,
        ...(unit === 'hours' ? { intervalHours: v } : {}),
        cron,
      },
    });
  };

  const addSource = () => {
    if (!config) return;
    setConfig({
      ...config,
      sources: [
        ...config.sources,
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `src-${Date.now()}`,
          enabled: true,
          type: 'devto',
          label: '新站点',
          tags: ['webdev'],
          articlesPerTag: 5,
          contentTrack: 'blog',
          priority: 'P2',
        },
      ],
    });
  };

  const insertPreset = (presetId: string) => {
    if (!config) return;
    const p = SOURCE_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `src-${Date.now()}`;
    setConfig({
      ...config,
      sources: [
        ...config.sources,
        {
          id,
          enabled: p.defaultEnabled ?? false,
          type: p.type,
          label: p.label,
          tags: [...p.tags],
          feedUrl: p.feedUrl,
          siteUrl: p.siteUrl,
          articlesPerTag: p.articlesPerTag ?? 5,
          contentTrack: p.contentTrack,
          priority: p.priority,
          expectedCategory: p.expectedCategory,
          crawlStrategy: p.crawlStrategy,
          extractTemplate: p.extractTemplate === 'none' ? undefined : p.extractTemplate,
        },
      ],
    });
  };

  const removeSource = (id: string) => {
    if (!config || config.sources.length <= 1) return;
    setConfig({ ...config, sources: config.sources.filter((s) => s.id !== id) });
  };

  const updateSource = (id: string, patch: Partial<CrawlerSourceRow>) => {
    if (!config) return;
    setConfig({
      ...config,
      sources: config.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const tagsString = (tags: string[] | undefined) => (tags || []).join(', ');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8 space-y-6 text-sm leading-relaxed">
        <header className="space-y-2 scroll-mt-24" id="top">
          <h1 className="text-2xl font-semibold tracking-tight">Codcompass 爬虫管理面板</h1>
          <p className="text-neutral-400 text-xs leading-relaxed">
            内容加工厂中控台（对齐文档 §66–129）：调度、爬虫核心配置、数据源与目标、执行审计与运维备忘；当前 Dev.to Runner
            已接入，其余统计与审计视图后续可接 SQLite 聚合 API。
          </p>
        </header>

        {config && (
          <div className="rounded-lg border border-neutral-700/80 bg-neutral-900/50 px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
            <span>
              上次运行：
              {config.lastRun?.at ? new Date(config.lastRun.at).toLocaleString('zh-CN') : '—'}
            </span>
            {config.lastRun?.durationMs != null && (
              <span>耗时：{(config.lastRun.durationMs / 1000).toFixed(1)}s</span>
            )}
            <span>下次（按间隔估算）：{nextRunEstimateText(config) ?? '—'}</span>
            <span className="text-neutral-600">
              代理 / 云端连通：以 <code className="text-neutral-500">HTTP_PROXY</code>、终端与 ingest 响应为准
            </span>
          </div>
        )}

        {loadError && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-red-200">{loadError}</div>
        )}

        {!config && !loadError && <p className="text-sm text-neutral-500">正在加载配置…</p>}

        {config && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col gap-3 border-b border-neutral-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-0.5 rounded-lg border border-neutral-800 bg-neutral-900/90 p-1 sm:max-w-[48rem]">
                <TabsTrigger value="overview" className={tabTriggerClass}>
                  概览
                </TabsTrigger>
                <TabsTrigger value="config" className={tabTriggerClass}>
                  配置
                </TabsTrigger>
                <TabsTrigger value="schedule" className={tabTriggerClass}>
                  调度
                </TabsTrigger>
                <TabsTrigger value="sources" className={tabTriggerClass}>
                  数据源
                </TabsTrigger>
                <TabsTrigger value="run" className={tabTriggerClass}>
                  运行
                </TabsTrigger>
                <TabsTrigger value="history" className={tabTriggerClass}>
                  运行记录
                </TabsTrigger>
                <TabsTrigger value="library" className={tabTriggerClass}>
                  本地库
                </TabsTrigger>
                <TabsTrigger value="ops" className={tabTriggerClass}>
                  运维
                </TabsTrigger>
                <TabsTrigger value="reference" className={tabTriggerClass}>
                  参考
                </TabsTrigger>
              </TabsList>
              <div className="flex shrink-0 items-center gap-3">
                {saveMsg && <span className="text-xs text-teal-400/90">{saveMsg}</span>}
                <button
                  type="button"
                  onClick={() => void save()}
                  className="rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-xs hover:bg-neutral-700"
                >
                  保存配置
                </button>
              </div>
            </div>

            <TabsContent value="overview" className="mt-4 space-y-6 outline-none">
              <section className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                  仪表盘 · 流水线漏斗
                </h2>
                <p className="text-xs text-neutral-500">
                  文档 §93–95：<strong className="text-neutral-400">抓取总数 → 达标总数 → 已同步总数</strong> 需在{' '}
                  <code className="text-neutral-400">sync_logs</code> 聚合；此处为占位说明，便于对照终端与 DB。
                </p>
                <div>
                  <h3 className="text-xs font-medium text-neutral-400 mb-2">站点规则模版（对照表）</h3>
                  <div className="overflow-x-auto rounded-lg border border-neutral-800">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-black/40 text-neutral-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">目标网站</th>
                          <th className="px-3 py-2 font-medium w-16">优先级</th>
                          <th className="px-3 py-2 font-medium">预期分类</th>
                          <th className="px-3 py-2 font-medium">抓取策略</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {SITE_RULE_TEMPLATE_ROWS.map((row) => (
                          <tr key={row.site} className="text-neutral-300 hover:bg-black/20">
                            <td className="px-3 py-2.5 font-medium text-neutral-200">{row.site}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className={
                                  row.priority === 'P0'
                                    ? 'text-rose-400/90'
                                    : row.priority === 'P1'
                                      ? 'text-amber-300/90'
                                      : 'text-neutral-500'
                                }
                              >
                                {row.priority}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-neutral-400 font-mono text-[11px]">{row.category}</td>
                            <td className="px-3 py-2.5 text-neutral-500 leading-relaxed">{row.strategy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                  推荐的第一批抓取目标（文档 §121–129）
                </h2>
                <div className="overflow-x-auto rounded-lg border border-neutral-800">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="bg-black/40 text-neutral-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">站点名称</th>
                        <th className="px-3 py-2 font-medium">内容属性</th>
                        <th className="px-3 py-2 font-medium">适合分类</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {FIRST_BATCH_TARGET_ROWS.map((row) => (
                        <tr key={row.site} className="text-neutral-300 hover:bg-black/20">
                          <td className="px-3 py-2.5 font-medium text-neutral-200">{row.site}</td>
                          <td className="px-3 py-2.5 text-neutral-500">{row.contentKind}</td>
                          <td className="px-3 py-2.5 text-neutral-400 font-mono text-[11px]">{row.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="config" className="mt-4 space-y-6 outline-none">
            <section
              id="crawler-config"
              className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-6"
            >
              <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                爬虫核心配置（文档 §73–82）
              </h2>
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">API 密钥（面板）</h3>
              <p className="text-xs text-neutral-500">
                若服务端设置了 <code className="text-neutral-400">LOCAL_CRAWLER_UI_SECRET</code>，请填写并会保存在本机浏览器 localStorage。
              </p>
              <input
                type="password"
                value={secret}
                onChange={(e) => persistSecret(e.target.value)}
                placeholder="未设置环境变量则留空"
                className="w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-neutral-200 placeholder:text-neutral-600"
              />
              </div>

              <div className="space-y-3 border-t border-neutral-800/80 pt-4">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">连接与模型（备忘）</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  <strong className="text-neutral-400">Base URL / 代理：</strong>爬虫进程读取{' '}
                  <code className="text-neutral-500">HTTP_PROXY</code>、<code className="text-neutral-500">HTTPS_PROXY</code>；Ingest 使用{' '}
                  <code className="text-neutral-500">NEXT_PUBLIC_SITE_URL</code> 与 <code className="text-neutral-500">INGEST_SECRET</code>。
                  <strong className="text-neutral-400"> LLM：</strong>路由/改写模型请在{' '}
                  <code className="text-neutral-500">automation/crawler</code> 内 scorer 与 OpenRouter 环境变量中配置；下方为面板备忘字段（写入 JSON，便于以后接统一配置）。
                </p>
                <label className="block space-y-1">
                  <span className="text-[11px] text-neutral-500">Ingest / 站点 Base URL 备忘</span>
                  <input
                    value={config.advanced.ingestBaseUrlHint}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        advanced: { ...config.advanced, ingestBaseUrlHint: e.target.value },
                      })
                    }
                    placeholder="例如 http://localhost:3000"
                    className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-[11px] text-neutral-500">路由模型（Fast）备忘</span>
                    <input
                      value={config.advanced.llmRoutingModelHint}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          advanced: { ...config.advanced, llmRoutingModelHint: e.target.value },
                        })
                      }
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-neutral-500">改写模型（Quality）备忘</span>
                    <input
                      value={config.advanced.llmQualityModelHint}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          advanced: { ...config.advanced, llmQualityModelHint: e.target.value },
                        })
                      }
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3 border-t border-neutral-800/80 pt-4">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  全局过滤与并发（文档 §68、§80–82）
                </h3>
                <label className="block space-y-1">
                  <span className="text-[11px] text-neutral-500">本地爬虫最大并发数（1–8，防止压力过大）</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={config.advanced.maxConcurrency}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        advanced: {
                          ...config.advanced,
                          maxConcurrency: Math.min(8, Math.max(1, Number(e.target.value) || 1)),
                        },
                      })
                    }
                    className="w-28 rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] text-neutral-500">关键词黑名单（逗号分隔，命中标题则跳过登记）</span>
                  <input
                    value={config.advanced.keywordBlacklist.join(', ')}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        advanced: {
                          ...config.advanced,
                          keywordBlacklist: e.target.value
                            .split(/[,，]+/)
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block space-y-1">
                    <span className="text-[11px] text-neutral-500">最小正文字符（0=关，与 Runner 内 100 字底线取较大值）</span>
                    <input
                      type="number"
                      min={0}
                      max={50000}
                      value={config.advanced.minContentChars}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          advanced: {
                            ...config.advanced,
                            minContentChars: Math.max(0, Number(e.target.value) || 0),
                          },
                        })
                      }
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-neutral-500">面板展示用达标分（与 CRAWLER_SCORE_THRESHOLD 对齐备忘）</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={config.advanced.minAiScorePanel}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          advanced: {
                            ...config.advanced,
                            minAiScorePanel: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                          },
                        })
                      }
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-neutral-500">单次登记上限（0=不限制）</span>
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={config.advanced.maxArticlesPerRun}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          advanced: {
                            ...config.advanced,
                            maxArticlesPerRun: Math.max(0, Number(e.target.value) || 0),
                          },
                        })
                      }
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                    />
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="text-[11px] text-neutral-500">关键字监控（逗号分隔，备忘 / 后续高亮）</span>
                  <input
                    value={config.advanced.globalWatchKeywords.join(', ')}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        advanced: {
                          ...config.advanced,
                          globalWatchKeywords: e.target.value
                            .split(/[,，]+/)
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                  />
                </label>
              </div>
            </section>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4 space-y-6 outline-none">
            <section id="scheduling" className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                任务调度与自动化（文档 §66–72）
              </h2>
              
              {/* 爬虫状态显示 */}
              <div className={`rounded-lg border p-3 space-y-2 ${
                crawlerStatus === 'running' ? 'border-cyan-800/40 bg-cyan-950/20' :
                crawlerStatus === 'completed' ? 'border-emerald-800/40 bg-emerald-950/20' :
                crawlerStatus === 'error' ? 'border-red-800/40 bg-red-950/20' :
                'border-neutral-800 bg-black/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      crawlerStatus === 'running' ? 'bg-cyan-400 animate-pulse' :
                      crawlerStatus === 'completed' ? 'bg-emerald-400' :
                      crawlerStatus === 'error' ? 'bg-red-400' :
                      'bg-neutral-500'
                    }`} />
                    <span className="text-xs font-medium text-neutral-200">
                      爬虫状态: {
                        crawlerStatus === 'running' ? '运行中' :
                        crawlerStatus === 'completed' ? '已完成' :
                        crawlerStatus === 'error' ? '错误' :
                        '空闲'
                      }
                    </span>
                    {crawlerStatusMsg && (
                      <span className="text-[10px] text-neutral-400">{crawlerStatusMsg}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void refreshCrawlerLogs()}
                      className="text-[10px] rounded border border-neutral-700 px-2 py-1 hover:bg-neutral-800 text-neutral-400"
                    >
                      刷新日志
                    </button>
                    {crawlerStatus !== 'idle' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCrawlerStatus('idle');
                          setCrawlerStatusMsg('');
                          setCrawlerRunning(false);
                          setCrawlerLogs([]);
                        }}
                        className="text-[10px] rounded border border-neutral-700 px-2 py-1 hover:bg-neutral-800 text-neutral-400"
                      >
                        重置状态
                      </button>
                    )}
                  </div>
                </div>
                {/* 日志显示 */}
                {crawlerLogs.length > 0 && (
                  <details open className="text-xs">
                    <summary className="cursor-pointer text-neutral-400 hover:text-neutral-300">
                      最近日志 ({crawlerLogs.length} 条)
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words bg-black/40 p-2 rounded text-[10px] text-neutral-400 font-mono">
                      {crawlerLogs.join('\n')}
                    </pre>
                  </details>
                )}
              </div>
              
              {/* 爬虫模式选择 */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">爬虫模式</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${crawlerMode === 'scheduled' ? 'border-cyan-600/70 bg-cyan-950/20' : 'border-neutral-800 bg-black/25'}`}>
                    <input
                      type="radio"
                      name="crawlerMode"
                      checked={crawlerMode === 'scheduled'}
                      onChange={() => setCrawlerMode('scheduled')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-200">定时爬虫</span>
                      <p className="text-xs text-neutral-500 mt-1">按固定时间间隔自动执行，适合持续监控新文章</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${crawlerMode === 'target' ? 'border-violet-600/70 bg-violet-950/20' : 'border-neutral-800 bg-black/25'}`}>
                    <input
                      type="radio"
                      name="crawlerMode"
                      checked={crawlerMode === 'target'}
                      onChange={() => setCrawlerMode('target')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-200">目标数量爬虫</span>
                      <p className="text-xs text-neutral-500 mt-1">按达标数量计算，完成目标数量为止，适合批量抓取</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${crawlerMode === 'category' ? 'border-emerald-600/70 bg-emerald-950/20' : 'border-neutral-800 bg-black/25'}`}>
                    <input
                      type="radio"
                      name="crawlerMode"
                      checked={crawlerMode === 'category'}
                      onChange={() => setCrawlerMode('category')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-200">知识库分类爬虫</span>
                      <p className="text-xs text-neutral-500 mt-1">按 KB 分类目标数量推送，智能路由到缺口最大的分类</p>
                    </div>
                  </label>
                </div>
              </div>

              {crawlerMode === 'target' && (
                <div className="rounded-lg border border-violet-800/40 bg-violet-950/20 p-4 space-y-3">
                  <h3 className="text-xs font-medium text-violet-300">目标数量设置</h3>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="block space-y-1">
                      <span className="text-xs text-neutral-500">目标文章数量</span>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={targetArticleCount}
                        onChange={(e) => setTargetArticleCount(Math.max(10, Math.min(5000, Number(e.target.value) || 100)))}
                        className="w-28 rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 font-mono text-sm"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs text-neutral-500">按数据源分配</span>
                      <select
                        value={targetDistribution}
                        onChange={(e) => setTargetDistribution(e.target.value as 'even' | 'priority' | 'custom')}
                        className="w-32 rounded-lg border border-neutral-700 bg-black/40 px-2 py-2 text-xs"
                      >
                        <option value="even">平均分配</option>
                        <option value="priority">按优先级分配</option>
                        <option value="custom">自定义（待实现）</option>
                      </select>
                    </label>
                    <span className="text-xs text-neutral-500">
                      当前已启用 {config.sources.filter(s => s.enabled).length} 个数据源
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    爬虫会持续运行直到达到目标数量，每个数据源按策略分配抓取量。
                    当前配置单次上限 <code className="text-neutral-400">{config.advanced.maxArticlesPerRun}</code> 篇。
                  </p>
                </div>
              )}

              {crawlerMode === 'category' && config && (
                <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-emerald-300">知识库分类目标设置</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-500">统一填充:</span>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={uniformCategoryTarget}
                          onChange={(e) => setUniformCategoryTarget(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
                          className="w-16 rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-center text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // 一键填充：将所有分类设置为目标数量
                            // 使用当前显示的分类列表（可能是 API 返回的或默认的）
                            const targets: Record<string, number> = {};
                            const currentCats = categoryStats.length > 0 ? categoryStats : DEFAULT_KB_SECTIONS;
                            currentCats.forEach((cat) => {
                              targets[cat.slug] = uniformCategoryTarget;
                            });
                            setConfig({ ...config, categoryTargets: targets });
                          }}
                          className="rounded-lg border border-cyan-700/80 bg-cyan-950/50 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-900/40"
                        >
                          一键填充
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadCategoryStats()}
                        disabled={categoryStatsLoading}
                        className="rounded-lg border border-emerald-700/80 bg-emerald-950/50 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-50"
                      >
                        {categoryStatsLoading ? '加载中...' : '刷新线上统计'}
                      </button>
                    </div>
                  </div>
                  {categoryStatsErr && (
                    <p className="text-xs text-red-400">{categoryStatsErr}</p>
                  )}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {/* 如果有统计数据，使用 API 返回的分类列表；否则使用默认分类列表 */}
                    {(categoryStats.length > 0 ? categoryStats : DEFAULT_KB_SECTIONS).map((cat) => {
                      const slug = cat.slug;
                      const name = cat.name;
                      const publishedCount = 'publishedCount' in cat ? (cat.publishedCount as number) : 0;
                      const target = config.categoryTargets?.[slug] || 0;
                      const gap = Math.max(0, target - publishedCount);
                      return (
                        <div key={slug} className="flex items-center gap-3 rounded-md border border-neutral-800 bg-black/20 p-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-neutral-200">{name}</span>
                            <span className="text-[10px] text-neutral-500 ml-1">({slug})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {categoryStats.length > 0 && (
                              <>
                                <span className="text-neutral-400">已发布: {publishedCount}</span>
                                <span className="text-neutral-500">/</span>
                              </>
                            )}
                            <input
                              type="number"
                              min={0}
                              max={200}
                              value={target}
                              onChange={(e) => {
                                const newTargets = { ...(config.categoryTargets || {}) };
                                newTargets[slug] = Math.max(0, Number(e.target.value) || 0);
                                setConfig({ ...config, categoryTargets: newTargets });
                              }}
                              className="w-16 rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-center text-xs"
                            />
                            {categoryStats.length > 0 && (
                              <span className={`text-xs ${gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {gap > 0 ? `还需 ${gap}` : '✅'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-neutral-500">
                    分类爬虫会根据目标数量与线上已发布数量的差值，智能选择最需要填充的分类进行路由。
                    当所有分类都达到目标数量时，爬虫会自动停止。
                  </p>
                </div>
              )}

              <p className="text-xs text-neutral-500">
                <code className="text-neutral-400">{scheduleCmd}</code> 按下方「数值 + 单位」等待后再次执行{' '}
                <code className="text-neutral-400">run.ts</code>；修改后保存，调度进程下一轮会重新读取。并发上限在「爬虫核心配置」中设置。
              </p>
              <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 space-y-2">
                <p className="text-xs text-neutral-400">
                  无需开终端：点击下方按钮会通过本机 Next API 自动执行一次完整爬虫（与「运行」页签相同）。
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={running}
                    onClick={() => void runCrawler()}
                    className="rounded-lg border border-amber-700/80 bg-amber-950/50 px-4 py-2 text-xs font-medium text-amber-100 hover:bg-amber-900/40 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {running ? '执行中…' : '立即自动运行一次'}
                  </button>
                  <span className="text-[11px] text-neutral-500">
                    长任务可能受 <code className="text-neutral-500">maxDuration</code> 限制；超时请到终端执行{' '}
                    <code className="text-neutral-400">{cmd}</code>。
                  </span>
                </div>
                {runResult && (
                  <p className={`text-xs ${runResult.ok ? 'text-emerald-400/95' : 'text-red-400/95'}`}>
                    最近一次触发：退出码 {runResult.exitCode === null ? '—' : String(runResult.exitCode)}。
                    完整 stdout / stderr 请打开「运行」页签查看。
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="block space-y-1">
                  <span className="text-xs text-neutral-500">间隔单位</span>
                  <select
                    value={config.schedule.intervalUnit ?? 'hours'}
                    onChange={(e) => {
                      const intervalUnit = e.target.value as CrawlerScheduleUnit;
                      const v = clampScheduleValueClient(intervalUnit, config.schedule.intervalValue ?? 1);
                      setConfig({
                        ...config,
                        schedule: {
                          ...config.schedule,
                          intervalUnit,
                          intervalValue: v,
                          ...(intervalUnit === 'hours' ? { intervalHours: v } : {}),
                        },
                      });
                    }}
                    className="w-32 rounded-lg border border-neutral-700 bg-black/40 px-2 py-2 text-xs"
                  >
                    <option value="minutes">分钟</option>
                    <option value="hours">小时</option>
                    <option value="days">天</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-neutral-500">
                    间隔数值（
                    {(config.schedule.intervalUnit ?? 'hours') === 'minutes'
                      ? '1–1440'
                      : (config.schedule.intervalUnit ?? 'hours') === 'days'
                        ? '1–30'
                        : '1–168'}
                    ）
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={
                      (config.schedule.intervalUnit ?? 'hours') === 'minutes'
                        ? 1440
                        : (config.schedule.intervalUnit ?? 'hours') === 'days'
                          ? 30
                          : 168
                    }
                    value={config.schedule.intervalValue ?? config.schedule.intervalHours ?? 6}
                    onChange={(e) => {
                      const intervalUnit = config.schedule.intervalUnit ?? 'hours';
                      const v = clampScheduleValueClient(intervalUnit, Number(e.target.value) || 1);
                      setConfig({
                        ...config,
                        schedule: {
                          ...config.schedule,
                          intervalUnit,
                          intervalValue: v,
                          ...(intervalUnit === 'hours' ? { intervalHours: v } : {}),
                        },
                      });
                    }}
                    className="w-28 rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 font-mono text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={applyIntervalToCron}
                  className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-xs hover:bg-neutral-700"
                >
                  按间隔更新 Cron 备忘
                </button>
              </div>
              <div className="rounded-lg bg-black/30 p-3 text-xs text-neutral-500 space-y-2">
                <p>常驻调度（在仓库根目录执行，建议 tmux 里挂着）：</p>
                <pre className="text-emerald-400/90">cd /path/to/CyberPunkWeb && {scheduleCmd}</pre>
                <button
                  type="button"
                  onClick={() => copy(`cd /path/to/CyberPunkWeb && ${scheduleCmd}`, 'sched')}
                  className="text-xs border border-neutral-600 rounded px-2 py-1 hover:bg-neutral-800"
                >
                  {copied === 'sched' ? '已复制' : '复制命令'}
                </button>
              </div>
              <h3 className="text-xs font-medium text-neutral-400 pt-1">Cron 备忘（可选 crontab 单次跑）</h3>
              <p className="text-xs text-neutral-500">
                单位为「小时」且数值整除 24 时，Cron 与 schedule 脚本语义较一致；分钟/天请以{' '}
                <code className="text-neutral-500">{scheduleCmd}</code> 为准。
              </p>
              <label className="block space-y-1">
                <span className="text-xs text-neutral-500">Cron 表达式</span>
                <input
                  value={config.schedule.cron}
                  onChange={(e) =>
                    setConfig({ ...config, schedule: { ...config.schedule, cron: e.target.value } })
                  }
                  className="w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-neutral-500">说明</span>
                <textarea
                  value={config.schedule.description}
                  onChange={(e) =>
                    setConfig({ ...config, schedule: { ...config.schedule, description: e.target.value } })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-xs"
                />
              </label>
              <div className="rounded-lg bg-black/30 p-3 text-xs text-neutral-500 space-y-2">
                <p>示例 crontab（请把路径换成你的仓库根目录）：</p>
                <pre className="overflow-x-auto text-emerald-400/90 whitespace-pre-wrap break-all">{crontabLine}</pre>
                <p className="text-amber-200/80 leading-relaxed">
                  <strong className="text-amber-100/90">勿在 zsh 里直接当命令回车：</strong>
                  <code className="text-neutral-400">*</code> 会被当成通配符，<code className="text-neutral-400">*/2</code> 会报{' '}
                  <code className="text-neutral-400">no matches found</code>。请用{' '}
                  <code className="text-neutral-400">crontab -e</code> 打开编辑器后粘贴整行；若必须在 shell 里试跑，整行用单引号包起来。
                </p>
                <button
                  type="button"
                  onClick={() => copy(crontabLine, 'cron')}
                  className="text-xs border border-neutral-600 rounded px-2 py-1 hover:bg-neutral-800"
                >
                  {copied === 'cron' ? '已复制' : '复制示例行'}
                </button>
              </div>
            </section>
            </TabsContent>

            <TabsContent value="sources" className="mt-4 space-y-6 outline-none">
            <section
              id="sources"
              className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-neutral-200">数据源与目标（文档 §84–90）</h2>
                <button
                  type="button"
                  onClick={addSource}
                  className="rounded-lg border border-emerald-800/80 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-900/30"
                >
                  新增空白行
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                站点管理库：URL、优先级、<strong className="text-neutral-400">提取模板</strong>（GitHub 热榜 / 技术博客 / 通用 RSS / Roadmap
                节点等）；抓取指标含关键字监控与每 tag 条数。Runner 当前仅合并已启用 <strong className="text-neutral-400">Dev.to</strong> tags。
              </p>
              <div className="rounded-lg border border-neutral-800/80 bg-black/20 p-3 space-y-2">
                <p className="text-xs font-medium text-neutral-400">从文档模版插入一行</p>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => insertPreset(p.id)}
                      className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-[11px] text-neutral-300 hover:border-teal-800/60 hover:text-teal-200/90"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {config.sources.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-neutral-800 bg-black/25 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <label className="flex items-center gap-2 text-xs text-neutral-400">
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          onChange={(e) => updateSource(s.id, { enabled: e.target.checked })}
                        />
                        参与本轮爬取（Dev.to）
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSource(s.id)}
                        disabled={config.sources.length <= 1}
                        className="text-xs text-red-400/90 hover:text-red-300 disabled:opacity-30"
                      >
                        删除此行
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-[11px] text-neutral-500">显示名称</span>
                        <input
                          value={s.label}
                          onChange={(e) => updateSource(s.id, { label: e.target.value })}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[11px] text-neutral-500">类型</span>
                        <select
                          value={s.type}
                          onChange={(e) => updateSource(s.id, { type: e.target.value as CrawlerSourceType })}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                        >
                          <option value="devto">Dev.to（tags）</option>
                          <option value="rss">RSS（预留）</option>
                          <option value="custom">自定义 URL（预留）</option>
                        </select>
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[11px] text-neutral-500">提取模板</span>
                        <select
                          value={s.extractTemplate ?? 'none'}
                          onChange={(e) => {
                            const v = e.target.value as CrawlerExtractTemplate;
                            updateSource(s.id, {
                              extractTemplate: v === 'none' ? undefined : v,
                            });
                          }}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                        >
                          {EXTRACT_TEMPLATE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[11px] text-neutral-500">轨道</span>
                        <select
                          value={s.contentTrack ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateSource(s.id, {
                              contentTrack:
                                v === 'kb' || v === 'blog' || v === 'ai'
                                  ? v
                                  : undefined,
                            });
                          }}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                        >
                          <option value="">未标注</option>
                          <option value="kb">KB</option>
                          <option value="blog">Blog</option>
                          <option value="ai">AI</option>
                        </select>
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[11px] text-neutral-500">优先级</span>
                        <select
                          value={s.priority ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateSource(s.id, {
                              priority:
                                v === 'P0' || v === 'P1' || v === 'P2' ? v : undefined,
                            });
                          }}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs"
                        >
                          <option value="">未标注</option>
                          <option value="P0">P0</option>
                          <option value="P1">P1</option>
                          <option value="P2">P2</option>
                        </select>
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-[11px] text-neutral-500">
                          {s.type === 'rss' ? 'RSS Feed URL' : '站点 URL（备忘）'}
                        </span>
                        <input
                          value={s.type === 'rss' ? (s.feedUrl ?? '') : (s.siteUrl ?? '')}
                          onChange={(e) => {
                            const v = e.target.value.trim() || undefined;
                            if (s.type === 'rss') updateSource(s.id, { feedUrl: v });
                            else updateSource(s.id, { siteUrl: v });
                          }}
                          placeholder={
                            s.type === 'rss'
                              ? 'https://example.com/feed.xml'
                              : 'https://…（custom / Dev.to 外链备忘）'
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs font-mono"
                        />
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-[11px] text-neutral-500">预期分类（如 KB / Systematic_Learning）</span>
                        <input
                          value={s.expectedCategory ?? ''}
                          onChange={(e) =>
                            updateSource(s.id, {
                              expectedCategory: e.target.value.trim() || undefined,
                            })
                          }
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs font-mono text-[11px]"
                        />
                      </label>
                    </div>
                    <label className="block space-y-1">
                      <span className="text-[11px] text-neutral-500">Dev.to tags（逗号或空格）</span>
                      <input
                        value={tagsString(s.tags)}
                        onChange={(e) =>
                          updateSource(s.id, {
                            tags: e.target.value
                              .split(/[,，\s]+/)
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        disabled={s.type !== 'devto'}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs disabled:opacity-40"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-neutral-500">
                        每 tag 条数
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={s.articlesPerTag ?? 5}
                          onChange={(e) =>
                            updateSource(s.id, { articlesPerTag: Number(e.target.value) || 5 })
                          }
                          disabled={s.type !== 'devto'}
                          className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 disabled:opacity-40"
                        />
                      </label>
                    </div>
                    <label className="block space-y-1">
                      <span className="text-[11px] text-neutral-500">抓取策略备忘</span>
                      <textarea
                        value={s.crawlStrategy ?? ''}
                        onChange={(e) =>
                          updateSource(s.id, {
                            crawlStrategy: e.target.value.trim() || undefined,
                          })
                        }
                        rows={2}
                        placeholder="与文档模版表「抓取策略」列一致，便于后续实现管线时对照"
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-300"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
            </TabsContent>

            <TabsContent value="run" className="mt-4 space-y-6 outline-none">
            <section
              id="jobs-audit"
              className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4"
            >
              <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                任务执行与审计（文档 §92–99）
              </h2>
              <ul className="text-xs text-neutral-500 list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-neutral-400">语义与路径：</strong>见终端日志中 KB/Blog 路由与{' '}
                  <code className="text-neutral-500">sync_logs.classification_json</code>；人工纠偏后续可做管理页。
                </li>
                <li>
                  <strong className="text-neutral-400">SimHash 冲突：</strong>近重复在日志与{' '}
                  <code className="text-neutral-500">IGNORED</code> / 预检记录中可查。
                </li>
                <li>
                  <strong className="text-neutral-400">AI 评分：</strong>每条加工记录的 score 字段（0–100）。
                </li>
              </ul>
              <div className="rounded-lg border border-teal-900/35 bg-teal-950/20 p-3 text-xs text-neutral-400 space-y-2 leading-relaxed">
                <p>
                  <strong className="text-teal-200/90">本地流水 vs 正式入库：</strong>抓取与评分结果先落在本地 SQLite（见「本地库」页签可检索）。达标（≥ 阈值）且开启{' '}
                  <code className="text-neutral-400">CRAWLER_PUSH</code> 后，再 <code className="text-neutral-500">POST</code> 到正式 Ingest：根 URL 优先级{' '}
                  <code className="text-neutral-400">CRAWLER_INGEST_BASE_URL</code> → <code className="text-neutral-400">NEXT_PUBLIC_SITE_URL</code> → 默认{' '}
                  <code className="text-neutral-400">http://localhost:3000</code>，并配好 <code className="text-neutral-400">INGEST_SECRET</code>。KB / Blog 仅由语义路由决定。
                </p>
                <p>
                  <strong className="text-teal-200/90">面板能看什么：</strong>「运行记录」为每轮汇总；「本地库」为按 URL/标题/状态查{' '}
                  <code className="text-neutral-500">sync_logs</code> 最新一条。正式站是否在{' '}
                  <code className="text-neutral-500">Article</code>/<code className="text-neutral-500">BlogPost</code> 入库，以 Ingest 目标环境为准。
                </p>
              </div>
              <h3 className="text-xs font-medium text-neutral-400">手动触发</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  disabled={running}
                  onClick={() => void runCrawler()}
                  className="rounded-lg border border-amber-800/80 bg-amber-950/40 px-4 py-2 text-xs text-amber-100 hover:bg-amber-900/30 disabled:opacity-50"
                >
                  {running ? '执行中…' : '通过 API 执行一次爬虫'}
                </button>
                <pre className="flex-1 min-w-[200px] overflow-x-auto rounded-lg bg-black/50 p-2 text-xs text-emerald-400/90">{cmd}</pre>
                <button
                  type="button"
                  onClick={() => copy(cmd, 'c')}
                  className="text-xs border border-neutral-600 rounded px-2 py-1 hover:bg-neutral-800"
                >
                  {copied === 'c' ? '已复制' : '复制命令'}
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                长时间任务建议在终端执行；API 可能受 <code className="text-neutral-400">maxDuration</code> 限制。
              </p>
              {runResult && (
                <div className="rounded-lg border border-neutral-800 bg-black/40 p-3 space-y-2 text-xs">
                  <p className={runResult.ok ? 'text-emerald-400' : 'text-red-400'}>
                    退出码: {runResult.exitCode === null ? '—' : String(runResult.exitCode)}
                  </p>
                  {runResult.stderrTail && (
                    <details open className="text-neutral-400">
                      <summary className="cursor-pointer text-red-300/90">stderr</summary>
                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words">{runResult.stderrTail}</pre>
                    </details>
                  )}
                  {runResult.stdoutTail && (
                    <details className="text-neutral-400">
                      <summary className="cursor-pointer">stdout（尾部）</summary>
                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words">{runResult.stdoutTail}</pre>
                    </details>
                  )}
                </div>
              )}
              {config.lastRun && !runResult && (
                <div className="rounded-lg border border-neutral-700/60 bg-black/30 p-3 text-xs text-neutral-500 space-y-1">
                  <p className="text-neutral-400">上次记录（{config.lastRun.at}）</p>
                  <p>退出码: {config.lastRun.exitCode === null ? '—' : String(config.lastRun.exitCode)}</p>
                  {config.lastRun.durationMs != null && (
                    <p>耗时: {(config.lastRun.durationMs / 1000).toFixed(1)}s</p>
                  )}
                </div>
              )}
            </section>
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-4 outline-none">
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-3">
                  <h2 className="text-lg font-medium text-neutral-200">最近运行情况</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs text-neutral-500 flex items-center gap-2">
                      <span>条数</span>
                      <select
                        value={historyLimit}
                        onChange={(e) =>
                          setHistoryLimit(Number(e.target.value) as 5 | 10 | 20 | 30 | 50)
                        }
                        className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200"
                      >
                        <option value={5}>最近 5 次</option>
                        <option value={10}>最近 10 次</option>
                        <option value={20}>最近 20 次</option>
                        <option value={30}>最近 30 次</option>
                        <option value={50}>最近 50 次</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => void loadRunHistory()}
                      className="text-xs rounded border border-neutral-600 px-2 py-1 hover:bg-neutral-800"
                    >
                      刷新
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  数据在每次 <code className="text-neutral-400">npm run crawler:local</code>、调度子进程或面板「通过 API
                  执行一次爬虫」结束时写入{' '}
                  <code className="text-neutral-400">automation/crawler/data/crawler-run-history.json</code>。
                  <strong className="text-neutral-400"> 获取数量</strong>：本轮从本地队列取出并执行加工的任务数（含断点续跑）。{' '}
                  <strong className="text-neutral-400">达标数量</strong>：AI 评分达到阈值并进入语义路由及后续流程的任务数。{' '}
                  <strong className="text-neutral-400">KB / Blog 推送</strong>：成功调用 Ingest 且对应路由类型的次数。
                </p>
                {historyErr && (
                  <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                    {historyErr}
                  </div>
                )}
                {!historyErr && historyRows.length === 0 && (
                  <p className="text-sm text-neutral-500">暂无记录。完成至少一次完整爬虫运行后会出现。</p>
                )}
                {historyRows.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-neutral-800">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-black/40 text-neutral-400">
                        <tr>
                          <th className="px-3 py-2 font-medium whitespace-nowrap">日期（北京时间）</th>
                          <th className="px-3 py-2 font-medium">网站</th>
                          <th className="px-3 py-2 font-medium text-right w-24">获取数量</th>
                          <th className="px-3 py-2 font-medium text-right w-24">达标数量</th>
                          <th className="px-3 py-2 font-medium text-right w-24">KB 推送</th>
                          <th className="px-3 py-2 font-medium text-right w-24">Blog 推送</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                        {historyRows.map((row, i) => (
                          <tr key={`${row.startedAt}-${row.endedAt}-${i}`} className="hover:bg-black/20">
                            <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                              {formatBeijingDateTime(row.startedAt)}
                            </td>
                            <td className="px-3 py-2.5 text-neutral-200 max-w-[220px] break-words">
                              {row.siteLabel}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{row.processed}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{row.qualified}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-cyan-400/90">
                              {row.kbPushed}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-violet-300/90">
                              {row.blogPushed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="library" className="mt-4 space-y-4 outline-none">
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-3">
                  <h2 className="text-lg font-medium text-neutral-200">本地库（SQLite）</h2>
                  <button
                    type="button"
                    onClick={() => void loadLibrary()}
                    disabled={libraryLoading}
                    className="text-xs rounded border border-neutral-600 px-2 py-1 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {libraryLoading ? '加载中…' : '刷新'}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  每条任务展示<strong className="text-neutral-400">最新一条</strong>{' '}
                  <code className="text-neutral-500">sync_logs</code>（含评分、同步状态、拟推送载荷中的标题）。正式环境入库发生在达标且{' '}
                  <code className="text-neutral-400">CRAWLER_PUSH</code> 开启时，请求发往{' '}
                  <code className="text-neutral-400">CRAWLER_INGEST_BASE_URL</code>（或回退 URL）所指向的站点。
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                  <label className="block min-w-[12rem] flex-1 space-y-1">
                    <span className="text-[11px] text-neutral-500">搜索 URL / 标题 / JSON 片段</span>
                    <input
                      value={libraryQ}
                      onChange={(e) => setLibraryQ(e.target.value)}
                      placeholder="例如 dev.to、文章标题关键词"
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200"
                    />
                  </label>
                  <label className="block w-40 space-y-1">
                    <span className="text-[11px] text-neutral-500">同步状态</span>
                    <select
                      value={libraryStatus}
                      onChange={(e) => setLibraryStatus(e.target.value)}
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200"
                    >
                      <option value="">全部</option>
                      <option value="SYNCED">SYNCED</option>
                      <option value="NOT_SYNCED">NOT_SYNCED</option>
                      <option value="SKIPPED">SKIPPED</option>
                      <option value="IGNORED">IGNORED</option>
                    </select>
                  </label>
                </div>
                {libraryErr && (
                  <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                    {libraryErr}
                  </div>
                )}
                {!libraryErr && libraryRows.length === 0 && !libraryLoading && (
                  <p className="text-sm text-neutral-500">暂无 sync_logs，或尚无匹配条件。请先跑一轮爬虫。</p>
                )}
                {libraryRows.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-neutral-800">
                    <p className="px-3 py-2 text-[11px] text-neutral-500">共 {libraryTotal} 条任务（当前展示 {libraryRows.length} 条）</p>
                    <table className="w-full min-w-[800px] text-left text-xs">
                      <thead className="bg-black/40 text-neutral-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">时间</th>
                          <th className="px-3 py-2 font-medium">标题</th>
                          <th className="px-3 py-2 font-medium">URL</th>
                          <th className="px-3 py-2 font-medium text-right w-14">分</th>
                          <th className="px-3 py-2 font-medium w-16">路由</th>
                          <th className="px-3 py-2 font-medium w-28">状态</th>
                          <th className="px-3 py-2 font-medium">备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                        {libraryRows.map((row) => (
                          <tr key={row.syncLogId} className="hover:bg-black/20">
                            <td className="px-3 py-2 align-top whitespace-nowrap font-mono text-[10px] text-neutral-500">
                              {formatBeijingDateTime(row.createdAt)}
                            </td>
                            <td className="px-3 py-2 align-top text-neutral-200 max-w-[200px] break-words">
                              {row.title ?? '—'}
                            </td>
                            <td className="px-3 py-2 align-top max-w-[240px]">
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-400/90 hover:text-teal-300 break-all"
                              >
                                {row.url}
                              </a>
                            </td>
                            <td className="px-3 py-2 align-top text-right tabular-nums">
                              {row.score ?? '—'}
                            </td>
                            <td className="px-3 py-2 align-top text-neutral-400">{row.routeType ?? '—'}</td>
                            <td className="px-3 py-2 align-top font-mono text-[10px] text-amber-200/80">{row.syncStatus}</td>
                            <td className="px-3 py-2 align-top text-neutral-500 max-w-[180px] break-words text-[11px]">
                              {row.note ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="ops" className="mt-4 space-y-6 outline-none">
              <section id="analytics" className="scroll-mt-24 space-y-6">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
                  <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                    运维监控与统计（文档 §101–107）
                  </h2>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    <strong className="text-neutral-400">Token / 费用：</strong>请在 OpenRouter 或云账单控制台查看；面板后续可接用量 API。
                    <strong className="text-neutral-400"> 存储：</strong>见下方 SQLite 路径；云端 Supabase/Blob 占用请在对应控制台查看。
                    <strong className="text-neutral-400"> GEO / JSON-LD：</strong>由 Ingest 管线生成比例可在文章表上聚合统计（占位说明）。
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
                  <h3 className="font-medium text-neutral-200">本地状态库</h3>
                  <code className="block text-xs text-amber-200/90 bg-black/40 p-2 rounded">{dbPath}</code>
                  <ul className="text-xs text-neutral-500 list-disc pl-4 space-y-1">
                    <li>
                      <strong className="text-neutral-400">crawl_tasks</strong>：PENDING → CRAWLED → COMPLETED / IGNORED / FAILED
                    </li>
                    <li>
                      <strong className="text-neutral-400">raw_materials</strong>：Dev.to 原始 JSON（可断点续加工）
                    </li>
                    <li>
                      <strong className="text-neutral-400">sync_logs</strong>：加工结果、simhash、是否 SYNCED；&lt;80 分为 SKIPPED
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-xs text-neutral-500">
                  <strong className="text-neutral-300">推送日志（同步状态看板备忘）：</strong>默认 AI ≥{' '}
                  <code className="text-neutral-400">CRAWLER_SCORE_THRESHOLD（80）</code> 且{' '}
                  <code className="text-neutral-400">CRAWLER_PUSH</code> 未关闭时调用正式 ingest；关闭推送时写入{' '}
                  <code className="text-neutral-400">data/pending-push/</code>，之后{' '}
                  <code className="text-neutral-400">npm run crawler:push-pending</code>。错误码见终端与 API 响应。
                </div>
              </section>
            </TabsContent>

            <TabsContent value="reference" className="mt-4 space-y-6 outline-none">
              <section id="reference" className="scroll-mt-24 space-y-6">
                <h2 className="text-lg font-medium text-neutral-200 border-b border-neutral-800 pb-2">
                  扩展参考源（KB / Blog / AI）
                </h2>
                <RefSitesBlock title="结构化知识库（KB）核心源" accent="cyan" sites={KB_REFERENCE_SITES} />
                <RefSitesBlock title="博客与实践经验（Blog）核心源" accent="violet" sites={BLOG_REFERENCE_SITES} />
                <RefSitesBlock title="AI Engineering 专项源" accent="amber" sites={AI_REFERENCE_SITES} />
              </section>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
