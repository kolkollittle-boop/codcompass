'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubscriptionData {
  plan: string;
  status: string;
  subscription: {
    planType: string;
    billingCycle: string;
    status: string;
    startedAt: string | null;
    nextBilledAt: string | null;
    canceledAt: string | null;
    customData: any;
  } | null;
}

interface UserStats {
  bookmarkCount: number;
  articlesRead: number;
  articlesReadThisWeek: number;
  memberSince: string | null;
}

export default function DashboardPage() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const router = useRouter();

  // Check session from both auth systems
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // 1. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setSupabaseSession(session);
        setLoading(false);
      }

      // 2. If neither is logged in, redirect to login page
      if (!session && nextAuthStatus === 'unauthenticated') {
        router.push('/login');
      }
    };

    checkAuth();

    // Listen for Supabase auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSupabaseSession(session);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      authSubscription.unsubscribe();
    };
  }, [nextAuthStatus, router]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!nextAuthSession?.user?.email && !supabaseSession?.user?.email) {
        return;
      }

      try {
        const { data: sb } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (sb?.session?.access_token) {
          headers.Authorization = `Bearer ${sb.session.access_token}`;
        }
        const res = await fetch('/api/user/subscription', {
          credentials: 'include',
          cache: 'no-store',
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };

    fetchSubscription();
  }, [nextAuthSession, supabaseSession]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!nextAuthSession?.user?.email && !supabaseSession?.user?.email) {
        return;
      }
      try {
        const { data: sb } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (sb?.session?.access_token) {
          headers.Authorization = `Bearer ${sb.session.access_token}`;
        }
        const res = await fetch('/api/user/stats', {
          credentials: 'include',
          cache: 'no-store',
          headers,
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [nextAuthSession, supabaseSession]);

  // Merge session data from both systems
  const session = supabaseSession?.user || nextAuthSession?.user;
  const isLoading = loading || nextAuthStatus === 'loading';

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div>
          <p className="mt-4 text-docs-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = (supabaseSession?.user as any)?.role === 'ADMIN' || (nextAuthSession?.user as any)?.role === 'ADMIN';

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="docs-card mb-8 rounded-xl border border-docs-border bg-docs-surface p-6">
            <div className="flex items-center gap-4">
              {(session as any)?.image && (
                <img
                  src={(session as any).image}
                  alt={(session as any).name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-docs-heading">
                  Welcome, {(session as any)?.name || 'User'}!
                </h1>
                <p className="text-docs-muted">{(session as any)?.email}</p>
                <span className="mt-2 inline-flex items-center rounded-full border border-docs-accent/40 bg-docs-green-subtle px-2.5 py-0.5 text-xs font-medium text-docs-accent">
                  {(session as any)?.role || 'USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6">
              <div className="mb-1 text-sm font-medium text-docs-muted">Articles Read</div>
              <div className="text-3xl font-bold text-docs-heading">
                {stats === null ? '—' : stats.articlesRead}
              </div>
              <div className="mt-2 text-sm text-emerald-400">
                {stats === null
                  ? 'Loading…'
                  : stats.articlesReadThisWeek > 0
                    ? `+${stats.articlesReadThisWeek} this week`
                    : 'Distinct articles while signed in'}
              </div>
            </div>
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6">
              <div className="mb-1 text-sm font-medium text-docs-muted">Bookmarks</div>
              <div className="text-3xl font-bold text-docs-heading">
                {stats === null ? '—' : stats.bookmarkCount}
              </div>
              <div className="mt-2 text-sm text-sky-400">Saved from articles</div>
            </div>
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6">
              <div className="mb-1 text-sm font-medium text-docs-muted">Subscription</div>
              <div className="text-3xl font-bold text-docs-heading">
                {subscription?.plan === 'BUILDER' ? 'Builder' :
                 subscription?.plan === 'PRO' ? 'Pro' :
                 subscription?.plan === 'ENTERPRISE' ? 'Enterprise' : 'Free'}
              </div>
              {(subscription?.status === 'active' || subscription?.status === 'trialing') && (
                <div className="text-sm text-green-400 mt-1">
                  {subscription?.status === 'trialing'
                    ? 'Free trial'
                    : subscription.subscription?.billingCycle === 'yearly'
                      ? 'Billed yearly'
                      : 'Billed monthly'}
                </div>
              )}
              {subscription?.status === 'active' || subscription?.status === 'trialing' ? (
                <div className="mt-3 space-y-2">
                  <a href="/dashboard/settings" className="block text-sm font-medium text-docs-accent hover:text-docs-accent-hover">
                    Manage →
                  </a>
                  {(() => {
                    // Check if subscription started within last 7 days
                    const startedAt = subscription.subscription?.startedAt;
                    if (!startedAt) return null;
                    
                    const startDate = new Date(startedAt);
                    const now = new Date();
                    const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                    
                    // Only show refund policy for first-time buyers (within 7 days)
                    if (daysSinceStart > 7) return null;
                    
                    const daysLeft = Math.ceil(7 - daysSinceStart);
                    
                    const userEmail = ((session as { email?: string })?.email || '').trim();
                    const siteBase =
                      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.codcompass.com';
                    const refundBody =
                      `Account email: ${userEmail}\n\n` +
                      'Please include:\n' +
                      '- Purchase date\n' +
                      '- Order / Transaction ID from your Paddle receipt\n' +
                      '- Reason for refund (optional)\n\n' +
                      'We will process per our refund policy within 3–5 business days.\n' +
                      `Full policy: ${siteBase.replace(/\/$/, '')}/refund\n`;
                    const mailtoHref = `mailto:support@codcompass.com?subject=${encodeURIComponent(
                      '[Codcompass] Subscription refund request'
                    )}&body=${encodeURIComponent(refundBody)}`;

                    return (
                      <div className="border-t border-docs-border pt-2">
                        <div className="text-xs text-docs-muted">
                          <span className="text-emerald-400">✓ 7-Day Refund Policy</span>
                          <p className="mt-1">
                            {daysLeft > 0
                              ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining for full refund`
                              : 'Full refund within 7 days of purchase'}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                          <a
                            href={mailtoHref}
                            className="inline-flex items-center justify-center rounded-lg bg-white/5 px-3 py-2 text-center text-sm font-medium text-docs-heading transition-colors hover:bg-white/10"
                          >
                            Request refund (email support)
                          </a>
                          <a
                            href="/refund"
                            className="text-xs text-docs-accent hover:text-docs-accent-hover"
                          >
                            Read full refund policy →
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <a href="/pricing" className="mt-2 text-sm font-medium text-docs-accent hover:text-docs-accent-hover">
                  Upgrade →
                </a>
              )}
            </div>
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6">
              <div className="mb-1 text-sm font-medium text-docs-muted">Member Since</div>
              {stats === null ? (
                <>
                  <div className="text-3xl font-bold text-docs-heading">—</div>
                  <div className="mt-2 text-sm text-docs-muted">Loading…</div>
                </>
              ) : stats.memberSince ? (
                <>
                  <div className="text-3xl font-bold text-docs-heading">
                    {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="mt-2 text-sm text-docs-muted">
                    {new Date(stats.memberSince).getFullYear()}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-docs-heading">—</div>
                  <div className="mt-2 text-sm text-docs-muted">Unavailable</div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <a
              href="/kb"
              className="docs-card group rounded-xl border border-docs-border bg-docs-surface p-6 transition-all hover:border-docs-accent/50 hover:shadow-cc-theme"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                <Icon name="book" size={20} className="text-docs-accent" />
              </div>
              <h3 className="mb-1 font-bold text-docs-heading">Browse Articles</h3>
              <p className="text-sm text-docs-muted">Explore our knowledge base</p>
            </a>
            <a
              href="/dashboard/bookmarks"
              className="docs-card group rounded-xl border border-docs-border bg-docs-surface p-6 transition-all hover:border-docs-accent/50 hover:shadow-cc-theme"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                <Icon name="bookmark" size={20} className="text-amber-400" />
              </div>
              <h3 className="mb-1 font-bold text-docs-heading">My Bookmarks</h3>
              <p className="text-sm text-docs-muted">View saved articles</p>
            </a>
            <a
              href="/dashboard/settings"
              className="docs-card group rounded-xl border border-docs-border bg-docs-surface p-6 transition-all hover:border-docs-accent/50 hover:shadow-cc-theme"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
                <Icon name="settings" size={20} className="text-docs-muted" />
              </div>
              <h3 className="mb-1 font-bold text-docs-heading">Settings</h3>
              <p className="text-sm text-docs-muted">Manage your account</p>
            </a>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="rounded-xl border border-docs-accent/30 bg-docs-surface-alt p-6">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="shield" size={24} className="text-docs-accent" />
                <h2 className="text-xl font-bold text-docs-heading">Admin Panel</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <a href="/admin" className="docs-card rounded-lg border border-docs-border bg-docs-surface p-4 transition-shadow hover:shadow-cc-theme">
                  <h3 className="mb-1 font-bold text-docs-heading">Admin Dashboard</h3>
                  <p className="text-sm text-docs-muted">Manage all content</p>
                </a>
                <a href="/admin/review" className="docs-card rounded-lg border border-docs-border bg-docs-surface p-4 transition-shadow hover:shadow-cc-theme">
                  <h3 className="mb-1 font-bold text-docs-heading">Article Review</h3>
                  <p className="text-sm text-docs-muted">Review & publish articles</p>
                </a>
                <a href="/admin/articles" className="docs-card rounded-lg border border-docs-border bg-docs-surface p-4 transition-shadow hover:shadow-cc-theme">
                  <h3 className="mb-1 font-bold text-docs-heading">Articles</h3>
                  <p className="text-sm text-docs-muted">Create & edit articles</p>
                </a>
                <a href="/admin/users" className="docs-card rounded-lg border border-docs-border bg-docs-surface p-4 transition-shadow hover:shadow-cc-theme">
                  <h3 className="mb-1 font-bold text-docs-heading">Users</h3>
                  <p className="text-sm text-docs-muted">Manage users</p>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
