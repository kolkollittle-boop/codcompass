# 爬虫代理配置使用指南

> **版本**: v1.0
> 
> **更新日期**: 2026-04-21

---

## 📋 目录

1. [快速开始](#快速开始)
2. [配置说明](#配置说明)
3. [使用方法](#使用方法)
4. [代理节点管理](#代理节点管理)
5. [故障排查](#故障排查)

---

## 快速开始

### 1. 确保 Clash Verge 正在运行

```bash
# 检查 Clash 是否运行
ps aux | grep clash

# 确保混合端口是 7897
# 在 Clash Verge 设置中确认
```

### 2. 安装依赖

```bash
cd ~/Desktop/CyberPunkWeb/crawler
pnpm install
```

### 3. 运行测试

```bash
# 测试 GitHub 爬虫
pnpm ts-node crawlers/github.ts
```

---

## 配置说明

### 代理配置文件

位置：`config/proxy-config.ts`

```typescript
// 目标市场优先级
const TARGET_MARKETS = {
  us: {
    priority: 1,      // 最高优先级
    nodes: [          // 美国节点列表
      '美国 01|流媒体解锁|US',
      '美国 02|流媒体解锁|US',
      // ...
    ],
  },
  eu: { /* 欧洲节点 */ },
  asia: { /* 亚洲节点 */ },
};
```

### 修改节点列表

根据你的 Clash 配置更新节点名称：

```typescript
// 1. 获取当前 Clash 节点列表
curl -s --unix-socket /tmp/verge/verge-mihomo.sock \
  http://localhost/proxies | jq '.proxies.Benz.all'

// 2. 复制节点名称到配置文件
nodes: [
  '你的节点名称 1',
  '你的节点名称 2',
  // ...
]
```

---

## 使用方法

### 基础使用

```typescript
import { BaseCrawler } from './lib/base-crawler';

class MyCrawler extends BaseCrawler {
  constructor() {
    super({
      region: 'us',      // 使用美国节点
      timeout: 30000,    // 30 秒超时
      retries: 3,        // 最多重试 3 次
    });
  }

  async crawl(url: string) {
    const result = await this.fetchWithProxy(url);
    return result;
  }
}
```

### 指定地区节点

```typescript
// 使用美国节点
const crawler = new MyCrawler({ region: 'us' });

// 使用欧洲节点
const crawler = new MyCrawler({ region: 'eu' });

// 使用亚洲节点
const crawler = new MyCrawler({ region: 'asia' });

// 任意节点 (轮询)
const crawler = new MyCrawler({ region: 'any' });
```

### 批量爬取

```typescript
const urls = [
  'https://github.com/trending/javascript',
  'https://github.com/trending/typescript',
  'https://github.com/trending/python',
];

for (const url of urls) {
  const result = await crawler.crawl(url);
  console.log(`${url}: ${result.success ? '成功' : '失败'}`);
}
```

---

## 代理节点管理

### 查看节点状态

```typescript
import { getProxyPool } from './lib/proxy-pool';

const pool = getProxyPool();

// 获取所有节点状态
const status = pool.getNodeStatus();
console.log(status);

// 获取统计信息
const stats = pool.getStats();
console.log(stats);
```

### 手动切换节点

```typescript
const pool = getProxyPool();

// 切换到指定节点
await pool.switchProxyNode('美国 03|流媒体解锁|US');
```

### 节点健康检查

代理池会自动执行健康检查：
- 每 5 分钟检查一次
- 连续失败 3 次的节点进入冷却 (1 分钟)
- 冷却结束后自动恢复

---

## 故障排查

### 问题 1: 无法连接代理

```
错误：connect ECONNREFUSED 127.0.0.1:7897
```

**解决方案:**
```bash
# 1. 检查 Clash 是否运行
ps aux | grep clash

# 2. 检查端口配置
cat ~/Library/Application\ Support/io.github.clash-verge-rev.clash-verge-rev/clash-verge.yaml | grep mixed-port

# 3. 重启 Clash Verge
```

### 问题 2: 所有节点都不可用

```
警告：没有可用节点
```

**解决方案:**
```bash
# 1. 检查节点列表是否正确
# 编辑 config/proxy-config.ts，确保节点名称与 Clash 中一致

# 2. 测试节点连通性
curl -x http://127.0.0.1:7897 https://github.com

# 3. 在 Clash Verge 中切换可用节点
```

### 问题 3: 爬取速度慢

**优化建议:**
```typescript
// 1. 增加并发 (谨慎)
const RATE_LIMITS = {
  requestsPerMinutePerNode: 20,  // 从 10 增加到 20
};

// 2. 减少延迟
const SITE_CONFIGS = {
  'github.com': {
    rateLimit: {
      delay: [1, 3],  // 从 [3,6] 减少到 [1,3]
    },
  },
};

// 3. 使用更多节点
const TARGET_MARKETS = {
  us: {
    nodes: [/* 添加更多美国节点 */],
  },
};
```

### 问题 4: 某些网站无法访问

**检查:**
```typescript
// 1. 查看使用的节点
const result = await crawler.crawl(url);
console.log(`使用节点：${result.proxyNode}`);

// 2. 切换到其他地区节点
const crawler = new MyCrawler({ region: 'eu' });  // 尝试欧洲节点

// 3. 检查网站是否需要特定地区 IP
```

---

## 监控命令

### 查看实时请求

```bash
# 查看 Clash 连接日志
tail -f ~/Library/Application\ Support/io.github.clash-verge-rev.clash-verge-rev/logs/clash.log
```

### 查看代理池状态

```typescript
// 添加监控脚本
setInterval(() => {
  const stats = pool.getStats();
  console.log(`总请求：${stats.totalRequests}`);
  console.log(`成功率：${stats.successRate}`);
  console.log(`可用节点：${stats.aliveNodes}/${stats.totalNodes}`);
}, 60000);  // 每分钟输出
```

---

## 最佳实践

### ✅ 推荐做法

```
1. 使用多个节点轮换 (避免单节点过载)
2. 设置合理的速率限制 (避免被封)
3. 优先使用 API (GitHub API 无需代理)
4. 监控节点健康状态
5. 准备备用代理方案
```

### ❌ 避免做法

```
1. 单节点高频请求 (容易触发限流)
2. 忽略错误日志 (可能节点已失效)
3. 无延迟连续请求 (容易被检测)
4. 使用过期的节点配置
```

---

## 性能优化

### 并发控制

```typescript
import pLimit from 'p-limit';

const limit = pLimit(5);  // 最多 5 个并发

const tasks = urls.map(url => 
  limit(() => crawler.crawl(url))
);

await Promise.all(tasks);
```

### 缓存策略

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });  // 1 小时缓存

async function crawlWithCache(url: string) {
  const cached = cache.get(url);
  if (cached) return cached;
  
  const result = await crawler.crawl(url);
  cache.set(url, result);
  return result;
}
```

---

## 相关文档

- [爬虫系统设计](./docs/05-爬虫系统设计.md)
- [代理配置](./config/proxy-config.ts)
- [代理池实现](./lib/proxy-pool.ts)

---

**最后更新**: 2026-04-21
