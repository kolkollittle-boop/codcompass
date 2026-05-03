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
      <main className="flex-grow">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">📝 Articles</h1>
              <p className="text-palette-textMuted mt-1">Create, edit, and manage all articles</p>
            </div>
            <button className="px-4 py-2 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover transition-colors">
              + New article
            </button>
          </div>

          {/* Articles Table */}
          <div className="bg-palette-bgCard rounded-xl border border-palette-border overflow-hidden">
            <table className="min-w-full divide-y divide-palette-border">
              <thead className="bg-palette-bgSecondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-palette-bgCard divide-y divide-palette-border">
                {articles.map((article) => (
                  <tr key={article.slug} className="hover:bg-palette-bgSecondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{article.titleEn}</div>
                      <div className="text-xs text-palette-textMuted truncate max-w-xs">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary">
                        {article.categories?.[0]?.Category?.[0]?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : article.status === 'REVIEW'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-palette-bgTertiary text-palette-textMuted border border-palette-border'
                      }`}>
                        {article.status === 'PUBLISHED' ? 'Published' : article.status === 'REVIEW' ? 'In review' : article.status === 'ARCHIVED' ? 'Archived' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.accessLevel === 'pro'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : article.accessLevel === 'builder'
                          ? 'bg-palette-bgTertiary text-palette-primary border border-palette-primary'
                          : 'bg-palette-bgTertiary text-palette-textMuted border border-palette-border'
                      }`}>
                        {article.accessLevel === 'pro' ? 'Pro' : article.accessLevel === 'builder' ? 'Builder' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-palette-textSecondary">
                      {article.qualityScore ? `${article.qualityScore}/100` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(article.slug)}
                        className="text-palette-primary hover:text-palette-accent mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(article.slug, article.titleEn)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-white mb-2">No articles yet</h3>
                <p className="text-palette-textMuted mb-4">Create your first article to get started</p>
                <button className="px-4 py-2 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover transition-colors">
                  Create article
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
