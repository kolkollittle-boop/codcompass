'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, FileText, Users, BarChart3, Settings, ShieldCheck } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow p-8">
        {/* 顶部标题 */}
        <header className="mb-10 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">COMMAND CENTER</h1>
          </div>
          <p className="text-zinc-400 text-sm">CodeCompass AI Knowledge Base Management</p>
        </header>

        {/* 功能网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* 🟢 核心入口：内容审核 */}
          <Link href="/admin/review" className="group relative block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-cyan-950/50 rounded-lg">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-cyan-400 transition-colors">Content Review</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              审核 AI 评分后的文章，进行人工干预、难度定级与发布。
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">AI Scored</span>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">Editorial</span>
            </div>
          </Link>

          {/* 🔒 预留入口：用户管理 */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Users className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-zinc-400">User Management</h2>
            <p className="text-sm text-zinc-600">
              管理会员订阅、用户权限与积分系统。(Coming Soon)
            </p>
          </div>

          {/* 🔒 预留入口：数据看板 */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <BarChart3 className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-zinc-400">Analytics</h2>
            <p className="text-sm text-zinc-600">
              查看流量来源、文章阅读量与转化率统计。(Coming Soon)
            </p>
          </div>

          {/* 🔒 预留入口：系统设置 */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Settings className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-zinc-400">System Config</h2>
            <p className="text-sm text-zinc-600">
              爬虫调度频率、API 密钥与 Webhook 配置。(Coming Soon)
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}