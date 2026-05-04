'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ArticlesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Fetch all articles using admin API
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        setArticles(data.data || []);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchArticles();
    }
  }, [status]);

  const handleEdit = (slug: string) => {
    router.push(`/admin/review?slug=${slug}`);
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete article "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArticles(articles.filter(a => a.slug !== slug));
        alert('Article deleted');
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
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
      <main className="flex-grow">
        <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-docs-heading">📝 Articles</h1>
              <p className="mt-1 text-docs-muted">Create, edit, and manage all articles</p>
            </div>
            <button className="rounded-lg bg-docs-accent px-4 py-2 font-medium text-white transition-colors hover:bg-docs-accent-hover">
              + New article
            </button>
          </div>

          {/* Articles Table */}
          <div className="docs-card overflow-hidden rounded-xl border border-docs-border bg-docs-surface">
            <table className="min-w-full divide-y divide-docs-border">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-docs-border bg-docs-surface">
                {articles.map((article) => (
                  <tr key={article.slug} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-docs-heading">{article.titleEn}</div>
                      <div className="max-w-xs truncate text-xs text-docs-muted">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-docs-accent/40 bg-docs-green-subtle px-2.5 py-0.5 text-xs font-medium text-docs-accent">
                        {article.categories?.[0]?.Category?.[0]?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.status === 'PUBLISHED' 
                          ? 'border border-green-500/20 bg-green-500/10 text-green-400' 
                          : article.status === 'REVIEW'
                          ? 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                          : 'border border-docs-border bg-white/5 text-docs-muted'
                      }`}>
                        {article.status === 'PUBLISHED' ? 'Published' : article.status === 'REVIEW' ? 'In review' : article.status === 'ARCHIVED' ? 'Archived' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.accessLevel === 'pro'
                          ? 'border border-purple-500/20 bg-purple-500/10 text-purple-400'
                          : article.accessLevel === 'builder'
                          ? 'border border-docs-accent/40 bg-docs-green-subtle text-docs-accent'
                          : 'border border-docs-border bg-white/5 text-docs-muted'
                      }`}>
                        {article.accessLevel === 'pro' ? 'Pro' : article.accessLevel === 'builder' ? 'Builder' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-docs-secondary">
                      {article.qualityScore ? `${article.qualityScore}/100` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(article.slug)}
                        className="mr-4 text-docs-accent transition-colors hover:text-docs-accent-hover"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(article.slug, article.titleEn)}
                        className="text-red-400 transition-colors hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articles.length === 0 && (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">📝</div>
                <h3 className="mb-2 text-lg font-medium text-docs-heading">No articles yet</h3>
                <p className="mb-4 text-docs-muted">Create your first article to get started</p>
                <button className="rounded-lg bg-docs-accent px-4 py-2 font-medium text-white transition-colors hover:bg-docs-accent-hover">
                  Create article
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer variant="docs" />
    </div>
  );
}
