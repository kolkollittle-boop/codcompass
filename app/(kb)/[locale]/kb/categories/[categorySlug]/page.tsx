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
  const t = translations.en;

  const catInfo = categoryBySlug(slug);
  if (!catInfo) notFound();

  const articles = await getArticlesByCategorySlug(slug, 100, 0);

  return (
    <div className="flex min-h-0 flex-col text-zinc-400">
      <div className="border-b border-docs-border bg-docs-surface py-16 text-white">
        <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/kb/categories`} className="mb-4 inline-block text-zinc-400 hover:text-white">
            ← {t.allCategories}
          </Link>
          <h1 className="flex items-center gap-3 text-4xl font-bold">
            <span>{catInfo.icon}</span>
            {catInfo.name}
          </h1>
          <p className="mt-4 text-xl text-zinc-400">
            {t.articlesIn} {catInfo.name}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">No articles in this category yet.</div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article: any) => {
              const content = getArticleContent(article, locale);
              return (
                <Link
                  key={article.id}
                  href={`/${locale}/kb/${article.slug}`}
                  className="docs-card group rounded-2xl bg-docs-surface p-6 transition-all hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-zinc-200">
                        {content.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-zinc-500">{content.excerpt || content.description}</p>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">👁️ {article.viewCount}</span>
                        {(article.accessLevel === 'builder' || article.accessLevel === 'pro') && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                              article.accessLevel === 'pro'
                                ? 'border-docs-border-hover bg-white/10 text-zinc-200'
                                : 'border-docs-border bg-docs-bg text-zinc-400'
                            }`}
                          >
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
