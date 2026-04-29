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

export default function DashboardPage() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 合并检查两种认证系统的 session
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // 1. 检查 Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setSupabaseSession(session);
        setLoading(false);
      }

      // 2. 如果两种都没登录，跳转登录页
      if (!session && nextAuthStatus === 'unauthenticated') {
        router.push('/login');
      }
    };

    checkAuth();

    // 监听 Supabase auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSupabaseSession(session);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [nextAuthStatus, router]);

  // 合并两种 session 数据
  const session = supabaseSession?.user || nextAuthSession?.user;
  const isLoading = loading || nextAuthStatus === 'loading';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = (supabaseSession?.user as any)?.role === 'ADMIN' || (nextAuthSession?.user as any)?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              {(session as any)?.image && (
                <img
                  src={(session as any).image}
                  alt={(session as any).name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {(session as any)?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{(session as any)?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                  {(session as any)?.role || 'USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Articles Read</div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-sm text-green-600 mt-2">+3 this week</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Bookmarks</div>
              <div className="text-3xl font-bold text-gray-900">5</div>
              <div className="text-sm text-blue-600 mt-2">Save for later</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Subscription</div>
              <div className="text-3xl font-bold text-gray-900">Free</div>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 font-medium">
                Upgrade →
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Member Since</div>
              <div className="text-3xl font-bold text-gray-900">Apr</div>
              <div className="text-sm text-gray-500 mt-2">2026</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="/kb" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <Icon name="book" size={20} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Browse Articles</h3>
              <p className="text-sm text-gray-600">Explore our knowledge base</p>
            </a>
            <a href="/dashboard/bookmarks" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <Icon name="bookmark" size={20} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">My Bookmarks</h3>
              <p className="text-sm text-gray-600">View saved articles</p>
            </a>
            <a href="/dashboard/settings" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                <Icon name="settings" size={20} className="text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </a>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="shield" size={24} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-indigo-900">Admin Panel</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <a href="/admin" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1">Admin Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage all content</p>
                </a>
                <a href="/admin/review" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1">Article Review</h3>
                  <p className="text-sm text-gray-600">Review & publish articles</p>
                </a>
                <a href="/admin/articles" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1">Articles</h3>
                  <p className="text-sm text-gray-600">Create & edit articles</p>
                </a>
                <a href="/admin/users" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1">Users</h3>
                  <p className="text-sm text-gray-600">Manage users</p>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
