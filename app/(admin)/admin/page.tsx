'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Header */}
          <div className="bg-indigo-600 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">🛡️ Admin Dashboard</h1>
                <p className="text-indigo-100 mt-1">Manage your Codcompass platform</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{session.user?.name}</p>
                <p className="text-indigo-100 text-sm">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Articles</div>
              <div className="text-3xl font-bold text-gray-900">8</div>
              <div className="text-sm text-green-600 mt-2">+5 this week</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
              <div className="text-3xl font-bold text-gray-900">24</div>
              <div className="text-sm text-blue-600 mt-2">+8 this week</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Subscribers</div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-sm text-yellow-600 mt-2">1 Pro, 2 Builder</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Revenue</div>
              <div className="text-3xl font-bold text-gray-900">$0</div>
              <div className="text-sm text-gray-500 mt-2">Lemon Squeezy pending</div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="/admin/articles" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">📝</div>
              <h3 className="font-bold text-gray-900 mb-1">Manage Articles</h3>
              <p className="text-sm text-gray-600">Create, edit, and delete articles</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                Manage →
              </div>
            </a>
            <a href="/admin/users" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                Manage →
              </div>
            </a>
            <a href="/admin/analytics" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">View traffic and engagement stats</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                View →
              </div>
            </a>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-center">
                <div className="text-lg mb-2">➕</div>
                <div className="text-sm font-medium text-gray-900">New Article</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-center">
                <div className="text-lg mb-2">📤</div>
                <div className="text-sm font-medium text-gray-900">Import Content</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-center">
                <div className="text-lg mb-2">📧</div>
                <div className="text-sm font-medium text-gray-900">Send Newsletter</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-center">
                <div className="text-lg mb-2">⚙️</div>
                <div className="text-sm font-medium text-gray-900">Settings</div>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
