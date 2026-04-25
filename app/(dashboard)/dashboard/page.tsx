'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
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

  const isAdmin = (session.user as any)?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {session.user?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{session.user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                  {(session.user as any)?.role || 'USER'}
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
            <a href="/kb" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-bold text-gray-900 mb-1">Browse Articles</h3>
              <p className="text-sm text-gray-600">Explore our knowledge base</p>
            </a>
            <a href="/dashboard/bookmarks" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">🔖</div>
              <h3 className="font-bold text-gray-900 mb-1">My Bookmarks</h3>
              <p className="text-sm text-gray-600">View saved articles</p>
            </a>
            <a href="/dashboard/settings" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="font-bold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </a>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-4">🛡️ Admin Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/admin" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1">Admin Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage all content</p>
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
