'use client';

import { useEffect, useRef, useCallback } from 'react';

// 事件类型定义
export type AnalyticsEvent =
  | { type: 'page_view'; path: string; referrer?: string }
  | { type: 'article_view'; articleId: string; slug: string; locale: string }
  | { type: 'article_scroll'; articleId: string; scrollPercent: number }
  | { type: 'paywall_impression'; articleId: string; copyVersion: string }
  | { type: 'paywall_click'; articleId: string; ctaText: string }
  | { type: 'blueprint_download'; articleId: string; blueprintName: string }
  | { type: 'search'; query: string; resultCount: number }
  | { type: 'newsletter_signup'; source: string }
  | { type: 'pricing_view'; plan?: string }
  | { type: 'checkout_start'; plan: string; price: number }
  | { type: 'checkout_complete'; plan: string; price: number }
  | { type: 'discord_click' };

// 配置
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000; // 5 秒

class AnalyticsQueue {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  track(event: AnalyticsEvent) {
    this.queue.push(event);
    
    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), FLUSH_INTERVAL);
    }
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    
    this.isFlushing = true;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      await navigator.sendBeacon(
        ANALYTICS_ENDPOINT,
        JSON.stringify({ events, timestamp: Date.now() })
      );
    } catch (error) {
      // 如果 sendBeacon 失败，将事件放回队列
      this.queue.unshift(...events);
    } finally {
      this.isFlushing = false;
    }
  }
}

// 单例
const analytics = new AnalyticsQueue();

// 页面卸载时刷新队列
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => analytics.flush());
}

// React Hooks
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent) => {
    analytics.track(event);
  }, []);

  return { track };
}

// 页面浏览追踪组件
export function PageViewTracker({ path }: { path: string }) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    track({
      type: 'page_view',
      path,
      referrer: document.referrer || undefined,
    });
  }, [path, track]);

  return null;
}

// 文章浏览追踪组件
export function ArticleViewTracker({ 
  articleId, 
  slug, 
  locale = 'en' 
}: { 
  articleId: string; 
  slug: string; 
  locale?: string;
}) {
  const { track } = useAnalytics();
  const scrollRef = useRef(false);
  
  useEffect(() => {
    track({ type: 'article_view', articleId, slug, locale });
    
    // 滚动追踪
    const handleScroll = () => {
      if (scrollRef.current) return;
      
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent >= 25) {
        scrollRef.current = true;
        track({ type: 'article_scroll', articleId, scrollPercent });
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleId, slug, locale, track]);

  return null;
}

// 付费墙印象追踪
export function PaywallImpressionTracker({ 
  articleId, 
  copyVersion 
}: { 
  articleId: string; 
  copyVersion: string;
}) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    track({ type: 'paywall_impression', articleId, copyVersion });
  }, [articleId, copyVersion, track]);

  return null;
}

// Blueprint 下载追踪
export function BlueprintDownloadTracker({ 
  articleId, 
  blueprintName 
}: { 
  articleId: string; 
  blueprintName: string;
}) {
  const { track } = useAnalytics();
  
  const handleDownload = useCallback(() => {
    track({ type: 'blueprint_download', articleId, blueprintName });
  }, [articleId, blueprintName, track]);

  return { handleDownload };
}

// 搜索追踪
export function SearchTracker({ 
  query, 
  resultCount 
}: { 
  query: string; 
  resultCount: number;
}) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    track({ type: 'search', query, resultCount });
  }, [query, resultCount, track]);

  return null;
}

// Newsletter 注册追踪
export function NewsletterSignupTracker({ source }: { source: string }) {
  const { track } = useAnalytics();
  
  const handleSignup = useCallback(() => {
    track({ type: 'newsletter_signup', source });
  }, [source, track]);

  return { handleSignup };
}

// 定价页浏览追踪
export function PricingViewTracker({ plan }: { plan?: string }) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    track({ type: 'pricing_view', plan });
  }, [plan, track]);

  return null;
}

// 结账开始追踪
export function CheckoutStartTracker() {
  const { track } = useAnalytics();
  
  const handleCheckoutStart = useCallback((plan: string, price: number) => {
    track({ type: 'checkout_start', plan, price });
  }, [track]);

  return { handleCheckoutStart };
}

// Discord 点击追踪
export function DiscordClickTracker() {
  const { track } = useAnalytics();
  
  const handleClick = useCallback(() => {
    track({ type: 'discord_click' });
  }, [track]);

  return { handleClick };
}

export default analytics;
