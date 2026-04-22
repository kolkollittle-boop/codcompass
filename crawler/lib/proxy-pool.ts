/**
 * 代理池管理器
 * 
 * 管理 Clash 多节点代理的轮换、健康检查、故障切换
 */

import { TARGET_MARKETS, CLASH_CONFIG, RATE_LIMITS } from '../config/proxy-config';

interface ProxyNode {
  name: string;
  region: string;
  alive: boolean;
  lastUsed?: number;
  failCount: number;
  cooldownUntil?: number;
}

interface ProxyStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

export class ProxyPoolManager {
  private nodes: Map<string, ProxyNode> = new Map();
  private currentNodeIndex = 0;
  private stats: Map<string, ProxyStats> = new Map();
  private refreshInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeNodes();
    this.startHealthCheck();
  }

  /**
   * 初始化所有代理节点
   */
  private initializeNodes() {
    const allNodes = [
      ...TARGET_MARKETS.us.nodes,
      ...TARGET_MARKETS.eu.nodes,
      ...TARGET_MARKETS.asia.nodes,
      ...TARGET_MARKETS.other.nodes,
    ];

    for (const nodeName of allNodes) {
      const region = this.extractRegion(nodeName);
      this.nodes.set(nodeName, {
        name: nodeName,
        region,
        alive: true,
        failCount: 0,
      });

      this.stats.set(nodeName, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
      });
    }

    console.log(`[ProxyPool] 初始化完成，共 ${this.nodes.size} 个节点`);
  }

  /**
   * 从节点名称提取地区
   */
  private extractRegion(nodeName: string): string {
    const match = nodeName.match(/\|(?:流媒体解锁\|)?([A-Z]{2})/);
    return match ? match[1] : 'UNKNOWN';
  }

  /**
   * 获取可用代理 (支持按地区筛选)
   */
  async getProxy(region?: 'us' | 'eu' | 'asia' | 'any'): Promise<string | null> {
    const targetNodes = region && region !== 'any' 
      ? TARGET_MARKETS[region]?.nodes || []
      : Array.from(this.nodes.keys());

    // 过滤出可用节点
    const availableNodes = targetNodes.filter(name => {
      const node = this.nodes.get(name);
      if (!node) return false;
      if (!node.alive) return false;
      if (node.cooldownUntil && Date.now() < node.cooldownUntil) return false;
      return true;
    });

    if (availableNodes.length === 0) {
      console.warn('[ProxyPool] 没有可用节点，尝试使用所有节点');
      // 如果筛选后没有节点，尝试使用所有节点
      const fallback = Array.from(this.nodes.keys()).find(
        name => {
          const node = this.nodes.get(name);
          return node && !node.cooldownUntil;
        }
      );
      return fallback || null;
    }

    // 轮询选择节点
    const selectedNode = availableNodes[
      this.currentNodeIndex % availableNodes.length
    ];
    this.currentNodeIndex++;

    const node = this.nodes.get(selectedNode)!;
    node.lastUsed = Date.now();

    console.log(`[ProxyPool] 选择节点：${selectedNode}`);
    return selectedNode;
  }

  /**
   * 获取代理 URL (用于 HTTP 请求)
   */
  async getProxyUrl(region?: 'us' | 'eu' | 'asia' | 'any'): Promise<string | null> {
    const nodeName = await this.getProxy(region);
    if (!nodeName) return null;

    // Clash mixed-port 默认是 7897
    return 'http://127.0.0.1:7897';
  }

  /**
   * 切换 Clash 代理节点
   */
  async switchProxyNode(nodeName: string): Promise<boolean> {
    try {
      // 通过 Clash API 切换节点
      const response = await fetch('http://127.0.0.1:9090/proxies/Benz', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nodeName,
        }),
      });

      if (response.ok) {
        console.log(`[ProxyPool] 已切换到节点：${nodeName}`);
        return true;
      } else {
        console.error(`[ProxyPool] 切换节点失败：${nodeName}`);
        return false;
      }
    } catch (error) {
      console.error('[ProxyPool] Clash API 调用失败:', error);
      return false;
    }
  }

  /**
   * 报告请求成功
   */
  reportSuccess(nodeName: string, responseTime: number) {
    const node = this.nodes.get(nodeName);
    const stats = this.stats.get(nodeName);

    if (node) {
      node.failCount = 0;  // 重置失败计数
      node.alive = true;
    }

    if (stats) {
      stats.totalRequests++;
      stats.successfulRequests++;
      // 更新平均响应时间
      stats.avgResponseTime = (
        stats.avgResponseTime * (stats.totalRequests - 1) + responseTime
      ) / stats.totalRequests;
    }
  }

  /**
   * 报告请求失败
   */
  reportFailure(nodeName: string, error?: any) {
    const node = this.nodes.get(nodeName);
    const stats = this.stats.get(nodeName);

    if (node) {
      node.failCount++;
      
      // 连续失败 3 次，标记为不可用并进入冷却
      if (node.failCount >= 3) {
        node.alive = false;
        node.cooldownUntil = Date.now() + RATE_LIMITS.nodeCooldownTime;
        console.warn(`[ProxyPool] 节点 ${nodeName} 进入冷却状态`);
      }
    }

    if (stats) {
      stats.totalRequests++;
      stats.failedRequests++;
    }

    console.error(`[ProxyPool] 节点 ${nodeName} 请求失败:`, error);
  }

  /**
   * 获取节点状态
   */
  getNodeStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [name, node] of this.nodes.entries()) {
      const stats = this.stats.get(name);
      status[name] = {
        alive: node.alive,
        region: node.region,
        failCount: node.failCount,
        cooldownUntil: node.cooldownUntil,
        lastUsed: node.lastUsed,
        stats: stats ? { ...stats } : null,
      };
    }

    return status;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const totalStats = {
      totalNodes: this.nodes.size,
      aliveNodes: Array.from(this.nodes.values()).filter(n => n.alive).length,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      successRate: 0,
    };

    for (const stats of this.stats.values()) {
      totalStats.totalRequests += stats.totalRequests;
      totalStats.successfulRequests += stats.successfulRequests;
      totalStats.failedRequests += stats.failedRequests;
    }

    totalStats.successRate = totalStats.totalRequests > 0
      ? (totalStats.successfulRequests / totalStats.totalRequests * 100).toFixed(2) + '%'
      : '0%';

    return totalStats;
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck() {
    // 每 5 分钟检查一次节点健康状态
    this.refreshInterval = setInterval(async () => {
      await this.healthCheck();
    }, 5 * 60 * 1000);

    console.log('[ProxyPool] 健康检查已启动 (每 5 分钟)');
  }

  /**
   * 健康检查
   */
  private async healthCheck() {
    console.log('[ProxyPool] 执行健康检查...');

    // 重置冷却过期的节点
    const now = Date.now();
    for (const node of this.nodes.values()) {
      if (node.cooldownUntil && now > node.cooldownUntil) {
        node.cooldownUntil = undefined;
        node.alive = true;
        node.failCount = 0;
        console.log(`[ProxyPool] 节点 ${node.name} 冷却结束，恢复可用`);
      }
    }

    // 通过 Clash API 获取最新节点状态
    try {
      const response = await fetch('http://127.0.0.1:9090/proxies');
      const data = await response.json();
      
      if (data.proxies?.Benz?.all) {
        // 更新节点状态
        for (const nodeName of data.proxies.Benz.all) {
          const node = this.nodes.get(nodeName);
          if (node) {
            // 这里可以根据需要更新节点状态
            node.alive = true;  // 简化处理，假设所有节点都可用
          }
        }
      }
    } catch (error) {
      console.error('[ProxyPool] 健康检查失败:', error);
    }
  }

  /**
   * 停止代理池
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    console.log('[ProxyPool] 代理池已停止');
  }
}

// 单例模式
let proxyPoolInstance: ProxyPoolManager | null = null;

export function getProxyPool(): ProxyPoolManager {
  if (!proxyPoolInstance) {
    proxyPoolInstance = new ProxyPoolManager();
  }
  return proxyPoolInstance;
}
