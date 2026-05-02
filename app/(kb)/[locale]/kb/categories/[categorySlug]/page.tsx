import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticlesByCategorySlug } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import { categoryBySlug } from '@/lib/categories';
import type { Metadata } from 'next';

interface CategorySlugPageProps {
  params: {
    locale: Locale;
    categorySlug: string;
  };
}

export async function generateMetadata({ params }: CategorySlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const slug = resolvedParams.categorySlug;
  
  return {
    title: `${slug} - Codcompass`,
    description: `Articles in the ${slug} category.`,
  };
}

const translations = {
  en: {
    allCategories: 'All Categories',
    articlesIn: 'Articles in',
  },
};

export default async function CategorySlugPage({ params }: CategorySlugPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const slug = resolvedParams.categorySlug;
  const t = translations.en; // Always use English translations
  
  const catInfo = categoryBySlug(slug);
  if (!catInfo) notFound();

  const articles = await getArticlesByCategorySlug(slug, 100, 0);

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      {/* Header */}
      <div className={`bg-gradient-to-r ${catInfo.color} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/kb/categories`} className="text-white/80 hover:text-white mb-4 inline-block">
            ← {t.allCategories}
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>{catInfo.icon}</span>
            {catInfo.name}
          </h1>
          <p className="mt-4 text-xl text-white/80">
            {t.articlesIn} {catInfo.name}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-palette-textMuted">
            No articles in this category yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article: any) => {
              const content = getArticleContent(article, locale);
              return (
                <Link
                  key={article.id}
                  href={`/${locale}/kb/${article.slug}`}
                  className="group bg-palette-bgCard rounded-2xl border border-palette-border p-6 hover:border-palette-border transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white group-hover:text-palette-primary mb-2">
                        {content.title}
                      </h3>
                      <p className="text-palette-textMuted line-clamp-2 mb-3">
                        {content.excerpt || content.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-palette-textMuted">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          👁️ {article.viewCount}
                        </span>
                        {(article.accessLevel === 'builder' || article.accessLevel === 'pro') && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            article.accessLevel === 'pro'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-palette-bgTertiary text-palette-primary border-palette-primary'
                          }`}>
                            {article.accessLevel === 'pro' ? 'Pro' : 'Builder'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}