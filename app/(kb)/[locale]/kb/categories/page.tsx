import Link from 'next/link';
import { getPublishedArticles, getArticleCount, getPremiumCount } from '@/lib/supabase';
import { getArticleContent, type Locale } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/categories';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    locale: Locale;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  return {
    title: 'Categories - Codcompass',
    description: 'Browse all technical categories: AI & LLM, Database, API Development, Frontend, Backend, DevOps, Mobile Development, Security, Product & Startup.',
  };
}

const translations = {
  en: {
    title: 'Browse by Category',
    subtitle: 'Explore our comprehensive library of technical tutorials organized by topic',
    articles: 'articles',
    viewAll: 'View All Articles',
    popularArticles: 'Popular Articles',
  },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = translations.en; // Always use English translations
  
  // Fetch dynamic counts
  const totalCount = await getArticleCount();
  const premiumCount = await getPremiumCount();
  
  // Fetch articles for each category
  const categoryData = await Promise.all(
    CATEGORIES.map(async (category) => {
      const count = await getArticleCount(category.slug);
      const articles = await getPublishedArticles(3, 0, locale);
      const filteredArticles = articles.filter((a: any) => 
        a.categories?.some((c: any) => c.Category?.slug === category.slug)
      );
      
      return {
        ...category,
        articles: filteredArticles.slice(0, 3),
        totalArticles: count,
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-palette-textSecondary max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/kb/categories/${category.slug}` as any}
              className="group bg-palette-bgCard rounded-2xl border border-palette-border p-6 hover:shadow-cc-theme hover:border-palette-primary transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <span className="text-sm text-palette-textMuted">
                  {category.totalArticles} {t.articles}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-palette-primary transition-colors">
                {category.name}
              </h3>
              
              <p className="text-sm text-palette-textMuted mb-4">
                {category.descriptionEn || category.description}
              </p>
              
              {category.articles.length > 0 && (
                <div className="space-y-2">
                  {category.articles.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/${locale}/kb/${article.slug}`}
                      className="flex items-center gap-2 text-sm hover:text-palette-primary group/article"
                    >
                      <svg className="w-4 h-4 text-palette-textMuted flex-shrink-0 group-hover/article:text-palette-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-palette-textSecondary truncate">
                        {getArticleContent(article, locale).title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-palette-border">
                <span className="text-sm text-palette-primary font-medium group-hover:text-palette-accent">
                  {t.viewAll} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-[color-mix(in_srgb,var(--primary)_14%,transparent)] to-[color-mix(in_srgb,var(--accent)_14%,transparent)] rounded-2xl p-8 border border-palette-primary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white">{totalCount}</div>
              <div className="text-sm text-palette-textMuted mt-1">
                Articles
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{CATEGORIES.length}</div>
              <div className="text-sm text-palette-textMuted mt-1">
                Categories
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{premiumCount}</div>
              <div className="text-sm text-palette-textMuted mt-1">
                Premium
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">2</div>
              <div className="text-sm text-palette-textMuted mt-1">
                Languages
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
