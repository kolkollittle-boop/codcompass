'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, FileText, Users, BarChart3, Settings, ShieldCheck, Globe } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-palette-bgPrimary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-primary mx-auto"></div>
          <p className="mt-4 text-palette-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow p-8">
        {/* Title */}
        <header className="mb-10 border-b border-palette-border pb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-palette-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-white">COMMAND CENTER</h1>
          </div>
          <p className="text-palette-textMuted text-sm">CodeCompass AI Knowledge Base Management</p>
        </header>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-site mx-auto">
          
          {/* Content review */}
          <Link href="/admin/review" className="group relative block p-6 bg-palette-bgCard border border-palette-border rounded-xl hover:border-palette-primary transition-all duration-300 hover:shadow-cc-theme">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-palette-bgSecondary rounded-lg">
                <FileText className="w-6 h-6 text-palette-accent" />
              </div>
              <ArrowRight className="w-5 h-5 text-palette-textMuted group-hover:text-palette-accent transition-colors" />
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-palette-accent transition-colors">Content Review</h2>
            <p className="text-sm text-palette-textMuted leading-relaxed">
              Review AI-scored articles: human edits, difficulty, and publish.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-palette-bgSecondary rounded text-palette-textMuted">AI Scored</span>
              <span className="text-[10px] px-2 py-0.5 bg-palette-bgSecondary rounded text-palette-textMuted">Editorial</span>
            </div>
          </Link>

          {/* User management (placeholder) */}
          <div className="p-6 bg-palette-bgSecondary border border-palette-border rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-palette-bgSecondary rounded-lg">
                <Users className="w-6 h-6 text-palette-textMuted" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-palette-textMuted">User Management</h2>
            <p className="text-sm text-palette-textMuted">
              Manage subscriptions, roles, and credits. (Coming Soon)
            </p>
          </div>

          {/* Analytics (placeholder) */}
          <div className="p-6 bg-palette-bgSecondary border border-palette-border rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-palette-bgSecondary rounded-lg">
                <BarChart3 className="w-6 h-6 text-palette-textMuted" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-palette-textMuted">Analytics</h2>
            <p className="text-sm text-palette-textMuted">
              Traffic sources, reads, and conversion. (Coming Soon)
            </p>
          </div>

          {/* Crawler settings */}
          <Link href="/admin/crawler-settings" className="group relative block p-6 bg-palette-bgCard border border-palette-border rounded-xl hover:border-palette-primary transition-all duration-300 hover:shadow-cc-theme">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-palette-bgSecondary rounded-lg">
                <Globe className="w-6 h-6 text-palette-accent" />
              </div>
              <ArrowRight className="w-5 h-5 text-palette-textMuted group-hover:text-palette-accent transition-colors" />
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-palette-accent transition-colors">Crawler Settings</h2>
            <p className="text-sm text-palette-textMuted leading-relaxed">
              Configure crawler schedule, sources, keywords, and translation.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-palette-bgSecondary rounded text-palette-textMuted">Scheduler</span>
              <span className="text-[10px] px-2 py-0.5 bg-palette-bgSecondary rounded text-palette-textMuted">Sources</span>
            </div>
          </Link>

          {/* System settings (placeholder) */}
          <div className="p-6 bg-palette-bgSecondary border border-palette-border rounded-xl opacity-60 cursor-not-allowed">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-palette-bgSecondary rounded-lg">
                <Settings className="w-6 h-6 text-palette-textMuted" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-palette-textMuted">System Config</h2>
            <p className="text-sm text-palette-textMuted">
              API keys and webhooks. (Coming Soon)
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}