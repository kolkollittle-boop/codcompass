/**
 * 爬虫代理配置
 * 
 * 使用 Clash Verge 多节点代理
 * 支持自动轮换、故障切换、速率限制
 */

// 目标市场优先级（根据业务需求）
const TARGET_MARKETS = {
  // 核心市场 - 美国
  us: {
    priority: 1,
    nodes: [
      '美国 01|流媒体解锁|US',
      '美国 02|流媒体解锁|US',
      '美国 03|流媒体解锁|US',
      '美国 04|流媒体解锁|US',
      '美国 05|流媒体解锁|US',
      '美国 06|流媒体解锁|US',
      '美国 07|流媒体解锁|US',
      '美国 08|流媒体解锁|US',
      '美国 09|流媒体解锁|US',
    ],
  },
  // 欧洲市场 - 英国、德国
  eu: {
    priority: 2,
    nodes: [
      '英国 01|流媒体解锁|UK',
      '英国 02|流媒体解锁|UK',
      '德国 01|流媒体解锁|DE',
      '德国 02|流媒体解锁|DE',
    ],
  },
  // 亚洲市场 - 新加坡、日本
  asia: {
    priority: 3,
    nodes: [
      '新加坡 01|流媒体解锁|SG',
      '新加坡 02|流媒体解锁|SG',
      '日本 01|流媒体解锁|JP',
      '日本 02|流媒体解锁|JP',
    ],
  },
  // 其他备用
  other: {
    priority: 4,
    nodes: [
      '加拿大 01|流媒体解锁|ES',
      '加拿大 02|流媒体解锁|ES',
      '韩国 01|流媒体解锁|KR',
      '韩国 02|流媒体解锁|KR',
    ],
  },
};

// Clash API 配置
const CLASH_CONFIG = {
  // Unix Socket (推荐，更快)
  unixSocket: '/tmp/verge/verge-mihomo.sock',
  
  // HTTP API (备用)
  httpApi: {
    host: '127.0.0.1',
    port: 9090,  // Clash 默认 API 端口
    secret: '',  // 如果有设置 secret
  },
  
  // 代理组名称 (在 Clash Verge 中配置的名称)
  proxyGroup: 'Benz',
};

// 速率限制配置 (保守设置，保护代理)
const RATE_LIMITS = {
  // 每个节点每分钟最大请求数
  requestsPerMinutePerNode: 10,
  
  // 请求间隔 (秒)
  minDelayBetweenRequests: 3,
  maxDelayBetweenRequests: 8,
  
  // 失败重试
  maxRetries: 3,
  retryDelay: 2000,  // 2 秒
  
  // 节点冷却时间 (失败后暂时不使用)
  nodeCooldownTime: 60000,  // 1 分钟
};

// 目标网站特定配置
const SITE_CONFIGS = {
  'github.com': {
    priority: 'us',  // 优先使用美国节点
    rateLimit: {
      requestsPerMinute: 15,
      delay: [3, 6],
    },
    // GitHub API 无需代理
    noProxyPaths: ['/api/', '/graphql'],
  },
  'news.ycombinator.com': {
    priority: 'us',
    rateLimit: {
      requestsPerMinute: 20,
      delay: [2, 5],
    },
  },
  'reddit.com': {
    priority: 'us',
    rateLimit: {
      requestsPerMinute: 15,
      delay: [3, 6],
    },
  },
  'dev.to': {
    priority: 'us',
    rateLimit: {
      requestsPerMinute: 10,
      delay: [4, 8],
    },
  },
  'medium.com': {
    priority: 'us',
    rateLimit: {
      requestsPerMinute: 8,
      delay: [5, 10],
    },
  },
};

export {
  TARGET_MARKETS,
  CLASH_CONFIG,
  RATE_LIMITS,
  SITE_CONFIGS,
};
