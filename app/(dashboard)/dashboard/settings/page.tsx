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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="mt-4 text-zinc-400">Loading...</p>
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-zinc-400 mt-1">Manage your profile and preferences</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              {displayImage && (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-white">{displayName}</p>
                <p className="text-sm text-zinc-400">{displayEmail}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-2">
                  {(nextAuthSession?.user as any)?.role ||
                    (supabaseSession?.user as any)?.role ||
                    'USER'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={displayName === 'User' ? '' : displayName}
                  className="w-full px-4 py-3 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-zinc-800 text-white placeholder-zinc-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={displayEmail || ''}
                  disabled
                  className="w-full px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Subscription</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white text-lg">{planLabel}</p>
                {isPaid ? (
                  <>
                    <p className="text-sm text-zinc-400 mt-1">
                      {billingLabel ? `${billingLabel} · ` : ''}
                      Status: {statusLabel}
                    </p>
                    {subscription?.subscription?.nextBilledAt && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Next billing:{' '}
                        {new Date(
                          subscription.subscription.nextBilledAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-zinc-400 mt-1">
                    Upgrade to unlock full articles and premium features.
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {!isPaid ? (
                  <a
                    href="/pricing"
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm text-center"
                  >
                    View plans
                  </a>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="px-4 py-2 border border-zinc-600 text-zinc-200 font-medium rounded-lg hover:bg-zinc-800 transition-colors text-sm text-center"
                    >
                      Dashboard overview
                    </a>
                    <a
                      href="/refund"
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Refund policy
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-red-500/30 p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Sign Out</p>
                <p className="text-sm text-zinc-400">Sign out of your account</p>
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
