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
  return {
    title: 'Categories - Codcompass',
    description:
      'Browse all technical categories: AI & LLM, Database, API Development, Frontend, Backend, DevOps, Mobile Development, Security, Product & Startup.',
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
  const t = translations.en;

  const totalCount = await getArticleCount();
  const premiumCount = await getPremiumCount();

  const categoryData = await Promise.all(
    CATEGORIES.map(async (category) => {
      const count = await getArticleCount(category.slug);
      const articles = await getPublishedArticles(3, 0, locale);
      const filteredArticles = articles.filter((a: any) =>
        a.categories?.some((c: any) => c.Category?.slug === category.slug),
      );

      return {
        ...category,
        articles: filteredArticles.slice(0, 3),
        totalArticles: count,
      };
    }),
  );

  return (
    <div className="flex min-h-0 flex-col text-zinc-400">
      <div className="border-b border-docs-border bg-docs-surface py-16 text-white">
        <div className="mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-400">{t.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryData.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/kb/categories/${category.slug}` as any}
              className="docs-card group rounded-2xl bg-docs-surface p-6 transition-all hover:bg-white/[0.02]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-2xl">
                  {category.icon}
                </div>
                <span className="text-sm text-zinc-500">
                  {category.totalArticles} {t.articles}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-zinc-200">
                {category.name}
              </h3>

              <p className="mb-4 text-sm text-zinc-500">{category.descriptionEn || category.description}</p>

              {category.articles.length > 0 && (
                <div className="space-y-2">
                  {category.articles.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/${locale}/kb/${article.slug}`}
                      className="group/article flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover/article:text-zinc-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="truncate">{getArticleContent(article, locale).title}</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-docs-border pt-4">
                <span className="text-sm font-medium text-zinc-300 transition-colors group-hover:text-white">
                  {t.viewAll} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 pb-12 sm:px-6 lg:px-8">
        <div className="docs-card rounded-2xl border border-docs-border bg-docs-surface p-8">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-white">{totalCount}</div>
              <div className="mt-1 text-sm text-zinc-500">Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{CATEGORIES.length}</div>
              <div className="mt-1 text-sm text-zinc-500">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{premiumCount}</div>
              <div className="mt-1 text-sm text-zinc-500">Premium</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">2</div>
              <div className="mt-1 text-sm text-zinc-500">Languages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
