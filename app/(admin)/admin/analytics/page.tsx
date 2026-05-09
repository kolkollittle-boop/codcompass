'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Eye, MousePointerClick, TrendingUp, BarChart3, Clock } from 'lucide-react';

interface AnalyticsStats {
  totalViews: number;
  totalClicks: number;
  avgTimeOnPage: string;
  bounceRate: string;
  topArticles: { title: string; views: number; clicks: number }[];
  dailyViews: { date: string; views: number }[];
  trafficSources: { source: string; visits: number; percentage: number }[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || (session?.user as any)?.role !== 'ADMIN') return;
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <div className="flex flex-1 items-center justify-center bg-docs-bg"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div><p className="mt-4 text-docs-muted">Loading...</p></div></div>;
  }
  if (!session) return null;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow p-8">
        <div className="mx-auto max-w-site">
          <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-docs-muted hover:text-docs-accent">
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Link>
          
          <header className="mb-8 border-b border-docs-border pb-6">
            <div className="mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-docs-accent" />
              <h1 className="text-2xl font-bold text-docs-heading">Analytics & Traffic</h1>
            </div>
            <p className="text-sm text-docs-muted">Monitor site traffic, article views, and user engagement</p>
          </header>

          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-docs-accent' },
              { label: 'Total Clicks', value: stats?.totalClicks || 0, icon: MousePointerClick, color: 'text-green-400' },
              { label: 'Avg Time', value: stats?.avgTimeOnPage || '0s', icon: Clock, color: 'text-yellow-400' },
              { label: 'Bounce Rate', value: stats?.bounceRate || '0%', icon: TrendingUp, color: 'text-red-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-docs-border bg-docs-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-docs-muted">{kpi.label}</span>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Integration Notice */}
          <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h2 className="mb-2 text-lg font-semibold text-yellow-400">⚠️ Traffic Tracking Not Configured</h2>
            <p className="text-sm text-docs-muted mb-3">Page view and click tracking requires an analytics integration. Choose one:</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-docs-border bg-docs-surface p-4">
                <h3 className="font-semibold text-docs-heading">Google Analytics 4 (Free)</h3>
                <p className="text-sm text-docs-muted">Full tracking, real-time data, traffic sources, user behavior.</p>
                <p className="text-xs text-docs-muted mt-2">Need: GA4 property ID + script injection</p>
              </div>
              <div className="rounded-lg border border-docs-border bg-docs-surface p-4">
                <h3 className="font-semibold text-docs-heading">Plausible (Privacy-first, $9/mo)</h3>
                <p className="text-sm text-docs-muted">Lightweight, no cookies, GDPR compliant, simple dashboard.</p>
                <p className="text-xs text-docs-muted mt-2">Need: Plausible account + script tag</p>
              </div>
            </div>
          </div>

          {/* Daily Views Chart */}
          <div className="mb-8 rounded-xl border border-docs-border bg-docs-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-docs-heading">Daily Views (Last 14 Days)</h2>
            <div className="flex items-end gap-1 h-32">
              {(stats?.dailyViews || []).map((d, i) => {
                const max = Math.max(...(stats?.dailyViews || []).map(x => x.views), 1);
                const h = Math.max(4, (d.views / max) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-docs-accent/20 rounded-t" style={{ height: `${h}%` }}>
                      <div className="w-full bg-docs-accent rounded-t" style={{ height: `${h}%`, opacity: 0.8 }}></div>
                    </div>
                    <span className="text-[9px] text-docs-muted mt-1">{d.date.slice(5)}</span>
                  </div>
                );
              })}
              {(stats?.dailyViews || []).length === 0 && <p className="text-sm text-docs-muted">No data yet — configure analytics to start tracking.</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Articles */}
            <div className="rounded-xl border border-docs-border bg-docs-surface p-6">
              <h2 className="mb-4 text-lg font-semibold text-docs-heading">📈 Top Articles</h2>
              <div className="space-y-3">
                {(stats?.topArticles || []).slice(0, 10).map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-docs-heading truncate mr-2">{i + 1}. {a.title.slice(0, 40)}...</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-docs-accent">{a.views} views</span>
                      <span className="text-docs-muted">{a.clicks} clicks</span>
                    </div>
                  </div>
                ))}
                {(stats?.topArticles || []).length === 0 && <p className="text-sm text-docs-muted">No data yet — configure analytics to start tracking.</p>}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="rounded-xl border border-docs-border bg-docs-surface p-6">
              <h2 className="mb-4 text-lg font-semibold text-docs-heading">🌐 Traffic Sources</h2>
              <div className="space-y-3">
                {(stats?.trafficSources || []).map(s => (
                  <div key={s.source} className="flex items-center justify-between">
                    <span className="text-sm text-docs-heading">{s.source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-docs-muted">{s.visits} visits</span>
                      <span className="text-sm font-semibold text-docs-accent">{s.percentage}%</span>
                    </div>
                  </div>
                ))}
                {(stats?.trafficSources || []).length === 0 && <p className="text-sm text-docs-muted">No data yet — configure analytics to start tracking.</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
