'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    customData: unknown;
  } | null;
}

export default function SettingsPage() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const router = useRouter();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setSupabaseSession(session);
        setAuthReady(true);
      }
    };
    init();
    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) setSupabaseSession(session);
    });
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || nextAuthStatus === 'loading') return;
    if (!supabaseSession && nextAuthStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authReady, nextAuthStatus, supabaseSession, router]);

  useEffect(() => {
    const load = async () => {
      if (!nextAuthSession?.user?.email && !supabaseSession?.user?.email) return;
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
          setSubscription(await res.json());
        }
      } catch (e) {
        console.error('Failed to fetch subscription:', e);
      }
    };
    load();
  }, [nextAuthSession, supabaseSession]);

  const sessionUser = supabaseSession?.user || nextAuthSession?.user;
  const u = sessionUser as any;
  const displayEmail = u?.email as string | undefined;
  const displayName =
    u?.user_metadata?.full_name ||
    u?.user_metadata?.name ||
    u?.name ||
    'User';
  const displayImage = u?.image || u?.user_metadata?.avatar_url;

  const isLoading = !authReady || nextAuthStatus === 'loading';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await signOut({ callbackUrl: '/' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent" />
          <p className="mt-4 text-docs-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sessionUser) return null;

  const planLabel =
    subscription?.plan === 'BUILDER'
      ? 'Builder'
      : subscription?.plan === 'PRO'
        ? 'Pro'
        : subscription?.plan === 'ENTERPRISE'
          ? 'Enterprise'
          : 'Free';

  const isPaid =
    subscription?.status === 'active' || subscription?.status === 'trialing';
  const billingLabel =
    subscription?.subscription?.billingCycle === 'yearly'
      ? 'Billed yearly'
      : subscription?.subscription?.billingCycle === 'monthly'
        ? 'Billed monthly'
        : '';

  const statusLabel =
    subscription?.status === 'trialing'
      ? 'Trialing'
      : subscription?.status === 'active'
        ? 'Active'
        : subscription?.status || '—';

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-docs-heading">Account Settings</h1>
            <p className="mt-1 text-docs-muted">Manage your profile and preferences</p>
          </div>

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-500/40 bg-docs-green-subtle p-4 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="docs-card mb-6 rounded-xl border border-docs-border bg-docs-surface p-6">
            <h2 className="mb-4 text-lg font-bold text-docs-heading">Profile Information</h2>
            <div className="mb-6 flex items-center gap-4">
              {displayImage && (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="h-20 w-20 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-docs-heading">{displayName}</p>
                <p className="text-sm text-docs-muted">{displayEmail}</p>
                <span className="mt-2 inline-flex items-center rounded-full border border-docs-accent/40 bg-docs-green-subtle px-2.5 py-0.5 text-xs font-medium text-docs-accent">
                  {(nextAuthSession?.user as any)?.role ||
                    (supabaseSession?.user as any)?.role ||
                    'USER'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-docs-secondary">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={displayName === 'User' ? '' : displayName}
                  className="w-full rounded-lg border border-docs-border bg-white/5 px-4 py-3 text-docs-heading placeholder:text-docs-muted focus:border-docs-accent focus:ring-2 focus:ring-docs-accent"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-docs-secondary">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={displayEmail || ''}
                  disabled
                  className="w-full rounded-lg border border-docs-border bg-docs-surface-alt px-4 py-3 text-docs-muted"
                />
                <p className="mt-1 text-xs text-docs-muted">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-docs-accent px-6 py-3 font-medium text-white transition-colors hover:bg-docs-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="docs-card mb-6 rounded-xl border border-docs-border bg-docs-surface p-6">
            <h2 className="mb-4 text-lg font-bold text-docs-heading">Subscription</h2>
            <div className="flex flex-col gap-4 rounded-lg border border-docs-border bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-medium text-docs-heading">{planLabel}</p>
                {isPaid ? (
                  <>
                    <p className="mt-1 text-sm text-docs-muted">
                      {billingLabel ? `${billingLabel} · ` : ''}
                      Status: {statusLabel}
                    </p>
                    {subscription?.subscription?.nextBilledAt && (
                      <p className="mt-1 text-xs text-docs-muted">
                        Next billing:{' '}
                        {new Date(
                          subscription.subscription.nextBilledAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-sm text-docs-muted">
                    Upgrade to unlock full articles and premium features.
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {!isPaid ? (
                  <a
                    href="/pricing"
                    className="rounded-lg bg-docs-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-docs-accent-hover"
                  >
                    View plans
                  </a>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="rounded-lg border border-docs-border px-4 py-2 text-center text-sm font-medium text-docs-secondary transition-colors hover:bg-white/10"
                    >
                      Dashboard overview
                    </a>
                    <a
                      href="/refund"
                      className="text-xs text-docs-accent hover:text-docs-accent-hover"
                    >
                      Refund policy
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="docs-card rounded-xl border border-red-500/30 bg-docs-surface p-6">
            <h2 className="mb-4 text-lg font-bold text-red-400">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-docs-heading">Sign Out</p>
                <p className="text-sm text-docs-muted">Sign out of your account</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
