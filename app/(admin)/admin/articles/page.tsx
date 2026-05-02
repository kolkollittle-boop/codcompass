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
    if (!confirm(`确定要删除文章 "${title}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArticles(articles.filter(a => a.slug !== slug));
        alert('文章已删除');
      } else {
        const error = await res.json();
        alert(`删除失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请重试');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">📝 文章管理</h1>
              <p className="text-zinc-400 mt-1">创建、编辑和管理所有文章</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              + 新建文章
            </button>
          </div>

          {/* Articles Table */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    文章
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    评分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                {articles.map((article) => (
                  <tr key={article.slug} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{article.titleEn}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-xs">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {article.categories?.[0]?.Category?.[0]?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : article.status === 'REVIEW'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {article.status === 'PUBLISHED' ? '已发布' : article.status === 'REVIEW' ? '待审核' : article.status === 'ARCHIVED' ? '已归档' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.accessLevel === 'pro'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : article.accessLevel === 'builder'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {article.accessLevel === 'pro' ? 'Pro' : article.accessLevel === 'builder' ? 'Builder' : '免费'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {article.qualityScore ? `${article.qualityScore}/100` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(article.slug)}
                        className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => handleDelete(article.slug, article.titleEn)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-white mb-2">暂无文章</h3>
                <p className="text-zinc-400 mb-4">创建第一篇文章开始</p>
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  创建文章
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
