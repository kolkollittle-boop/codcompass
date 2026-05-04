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
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div>
          <p className="mt-4 text-docs-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow p-8">
        {/* Title */}
        <header className="mb-10 border-b border-docs-border pb-6">
          <div className="mb-2 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-docs-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-docs-heading">COMMAND CENTER</h1>
          </div>
          <p className="text-sm text-docs-muted">CodeCompass AI Knowledge Base Management</p>
        </header>

        {/* Feature grid */}
        <div className="mx-auto grid max-w-site grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Content review */}
          <Link
            href="/admin/review"
            className="docs-card group relative block rounded-xl border border-docs-border bg-docs-surface p-6 transition-all duration-300 hover:border-docs-accent/50 hover:shadow-cc-theme"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-white/5 p-2">
                <FileText className="h-6 w-6 text-docs-accent" />
              </div>
              <ArrowRight className="h-5 w-5 text-docs-muted transition-colors group-hover:text-docs-accent" />
            </div>
            <h2 className="mb-1 text-lg font-semibold transition-colors group-hover:text-docs-accent">Content Review</h2>
            <p className="text-sm leading-relaxed text-docs-muted">
              Review AI-scored articles: human edits, difficulty, and publish.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-docs-muted">AI Scored</span>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-docs-muted">Editorial</span>
            </div>
          </Link>

          {/* User management (placeholder) */}
          <div className="cursor-not-allowed rounded-xl border border-docs-border bg-white/5 p-6 opacity-60">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-white/5 p-2">
                <Users className="h-6 w-6 text-docs-muted" />
              </div>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-docs-muted">User Management</h2>
            <p className="text-sm text-docs-muted">Manage subscriptions, roles, and credits. (Coming Soon)</p>
          </div>

          {/* Analytics (placeholder) */}
          <div className="cursor-not-allowed rounded-xl border border-docs-border bg-white/5 p-6 opacity-60">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-white/5 p-2">
                <BarChart3 className="h-6 w-6 text-docs-muted" />
              </div>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-docs-muted">Analytics</h2>
            <p className="text-sm text-docs-muted">Traffic sources, reads, and conversion. (Coming Soon)</p>
          </div>

          {/* Crawler settings */}
          <Link
            href="/admin/crawler-settings"
            className="docs-card group relative block rounded-xl border border-docs-border bg-docs-surface p-6 transition-all duration-300 hover:border-docs-accent/50 hover:shadow-cc-theme"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-white/5 p-2">
                <Globe className="h-6 w-6 text-docs-accent" />
              </div>
              <ArrowRight className="h-5 w-5 text-docs-muted transition-colors group-hover:text-docs-accent" />
            </div>
            <h2 className="mb-1 text-lg font-semibold transition-colors group-hover:text-docs-accent">Crawler Settings</h2>
            <p className="text-sm leading-relaxed text-docs-muted">
              Configure crawler schedule, sources, keywords, and translation.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-docs-muted">Scheduler</span>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-docs-muted">Sources</span>
            </div>
          </Link>

          {/* System settings (placeholder) */}
          <div className="cursor-not-allowed rounded-xl border border-docs-border bg-white/5 p-6 opacity-60">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-white/5 p-2">
                <Settings className="h-6 w-6 text-docs-muted" />
              </div>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-docs-muted">System Config</h2>
            <p className="text-sm text-docs-muted">API keys and webhooks. (Coming Soon)</p>
          </div>
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}