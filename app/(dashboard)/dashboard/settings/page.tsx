'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: Implement settings save
    setTimeout(() => {
      setIsSaving(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-zinc-400 mt-1">Manage your profile and preferences</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-white">{session.user?.name || 'User'}</p>
                <p className="text-sm text-zinc-400">{session.user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-2">
                  {(session.user as any)?.role || 'USER'}
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
                  defaultValue={session.user?.name || ''}
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
                  defaultValue={session.user?.email || ''}
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

          {/* Subscription Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Subscription</h2>
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Free Plan</p>
                <p className="text-sm text-zinc-400">Access to 10% of articles</p>
              </div>
              <a
                href="/pricing"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Upgrade
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-zinc-900 rounded-xl border border-red-500/30 p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Sign Out</p>
                <p className="text-sm text-zinc-400">Sign out of your account</p>
              </div>
              <button
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
