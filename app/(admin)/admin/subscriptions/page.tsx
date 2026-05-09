'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Users, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  byPlan: { plan: string; count: number; revenue: number }[];
  recentSubscriptions: {
    id: string;
    userEmail: string;
    plan: string;
    status: string;
    amount: number;
    currency: string;
    startDate: string;
    endDate: string | null;
  }[];
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || (session?.user as any)?.role !== 'ADMIN') return;
    fetch('/api/admin/subscriptions')
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
              <CreditCard className="h-8 w-8 text-docs-accent" />
              <h1 className="text-2xl font-bold text-docs-heading">Subscription Management</h1>
            </div>
            <p className="text-sm text-docs-muted">Monitor revenue, manage plans, track subscriber growth</p>
          </header>

          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { label: 'Total Subs', value: stats?.totalSubscribers || 0, icon: Users, color: 'text-docs-accent' },
              { label: 'Active', value: stats?.activeSubscriptions || 0, icon: TrendingUp, color: 'text-green-400' },
              { label: 'Canceled', value: stats?.canceledSubscriptions || 0, icon: Calendar, color: 'text-red-400' },
              { label: 'MRR', value: '$' + (stats?.mrr || 0).toFixed(0), icon: DollarSign, color: 'text-yellow-400' },
              { label: 'ARR', value: '$' + (stats?.arr || 0).toFixed(0), icon: DollarSign, color: 'text-purple-400' },
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

          {/* Revenue by Plan */}
          <div className="mb-8 rounded-xl border border-docs-border bg-docs-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-docs-heading">Revenue by Plan</h2>
            <div className="space-y-3">
              {(stats?.byPlan || []).map(p => (
                <div key={p.plan} className="flex items-center justify-between">
                  <span className="text-sm text-docs-heading">{p.plan}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-docs-muted">{p.count} subscribers</span>
                    <span className="text-sm font-semibold text-docs-accent">${p.revenue}/mo</span>
                  </div>
                </div>
              ))}
              {(stats?.byPlan || []).length === 0 && <p className="text-sm text-docs-muted">No subscription data yet.</p>}
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="rounded-xl border border-docs-border bg-docs-surface overflow-hidden">
            <div className="p-6 border-b border-docs-border">
              <h2 className="text-lg font-semibold text-docs-heading">Recent Subscriptions</h2>
            </div>
            <table className="min-w-full divide-y divide-docs-border">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-docs-muted">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-docs-border">
                {(stats?.recentSubscriptions || []).map(s => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-docs-heading">{s.userEmail}</td>
                    <td className="px-6 py-4 text-sm text-docs-heading">{s.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-docs-accent">${s.amount} {s.currency}</td>
                    <td className="px-6 py-4 text-sm text-docs-muted">{s.startDate}</td>
                    <td className="px-6 py-4 text-sm text-docs-muted">{s.endDate || '—'}</td>
                  </tr>
                ))}
                {(stats?.recentSubscriptions || []).length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-docs-muted">No subscriptions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
