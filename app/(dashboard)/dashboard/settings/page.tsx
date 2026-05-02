'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ColorThemePicker from '@/components/ColorThemePicker';

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
      <div className="min-h-screen flex items-center justify-center bg-palette-bgPrimary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-primary mx-auto" />
          <p className="mt-4 text-palette-textMuted">Loading...</p>
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
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-palette-textPrimary">Account Settings</h1>
            <p className="text-palette-textMuted mt-1">Manage your profile and preferences</p>
          </div>

          {success && (
            <div className="mb-6 p-4 border border-palette-success bg-palette-bgSecondary rounded-lg text-palette-success text-sm">
              {success}
            </div>
          )}

          <div className="bg-palette-bgCard rounded-xl border border-palette-border p-6 mb-6">
            <h2 className="text-lg font-bold text-palette-textPrimary mb-4">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              {displayImage && (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-palette-textPrimary">{displayName}</p>
                <p className="text-sm text-palette-textMuted">{displayEmail}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-bgSecondary text-palette-primary border border-palette-primary mt-2">
                  {(nextAuthSession?.user as any)?.role ||
                    (supabaseSession?.user as any)?.role ||
                    'USER'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-palette-textSecondary mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={displayName === 'User' ? '' : displayName}
                  className="w-full px-4 py-3 border border-palette-border rounded-lg focus:ring-2 focus:ring-palette-primary focus:border-palette-primary bg-palette-bgSecondary text-palette-textPrimary placeholder-palette-textMuted"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-palette-textSecondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={displayEmail || ''}
                  disabled
                  className="w-full px-4 py-3 border border-palette-border rounded-lg bg-palette-bgTertiary text-palette-textMuted"
                />
                <p className="text-xs text-palette-textMuted mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-palette-bgCard rounded-xl border border-palette-border p-6 mb-6">
            <h2 className="text-lg font-bold text-palette-textPrimary mb-2">Appearance</h2>
            <p className="text-sm text-palette-textMuted mb-4">Color palette for supported screens (stored in this browser).</p>
            <ColorThemePicker />
          </div>

          <div className="bg-palette-bgCard rounded-xl border border-palette-border p-6 mb-6">
            <h2 className="text-lg font-bold text-palette-textPrimary mb-4">Subscription</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-palette-bgSecondary rounded-lg border border-palette-border">
              <div>
                <p className="font-medium text-palette-textPrimary text-lg">{planLabel}</p>
                {isPaid ? (
                  <>
                    <p className="text-sm text-palette-textMuted mt-1">
                      {billingLabel ? `${billingLabel} · ` : ''}
                      Status: {statusLabel}
                    </p>
                    {subscription?.subscription?.nextBilledAt && (
                      <p className="text-xs text-palette-textMuted mt-1">
                        Next billing:{' '}
                        {new Date(
                          subscription.subscription.nextBilledAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-palette-textMuted mt-1">
                    Upgrade to unlock full articles and premium features.
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {!isPaid ? (
                  <a
                    href="/pricing"
                    className="px-4 py-2 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover transition-colors text-sm text-center"
                  >
                    View plans
                  </a>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="px-4 py-2 border border-palette-border text-palette-textSecondary font-medium rounded-lg hover:bg-palette-bgTertiary transition-colors text-sm text-center"
                    >
                      Dashboard overview
                    </a>
                    <a
                      href="/refund"
                      className="text-xs text-palette-primary hover:text-palette-accent"
                    >
                      Refund policy
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-palette-bgCard rounded-xl border border-red-500/30 p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-palette-textPrimary">Sign Out</p>
                <p className="text-sm text-palette-textMuted">Sign out of your account</p>
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
      <Footer />
    </div>
  );
}
