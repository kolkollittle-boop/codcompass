import { getArticleCount, getPremiumCount } from '@/lib/supabase';
import type { Locale } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/categories';
import { getKbCategoryBrowseGroups } from '@/lib/kb-nav-tree';
import { KbCategoriesTieredList } from '@/components/kb/KbCategoriesTieredList';
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
      'Knowledge Base browse tree: structured topics for tutorials and reference articles—not blog posts.',
  };
}

const translations = {
  en: {
    title: 'Browse by Category',
    subtitle: 'Open a section to see topics and jump to article lists',
    articles: 'articles',
    sections: 'Sections',
    topics: 'Topics',
  },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = translations.en;

  const totalCount = await getArticleCount();
  const premiumCount = await getPremiumCount();

  const groups = getKbCategoryBrowseGroups();

  const countBySlug: Record<string, number> = {};
  await Promise.all(
    CATEGORIES.map(async (category) => {
      countBySlug[category.slug] = await getArticleCount(category.slug);
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
        <KbCategoriesTieredList
          locale={locale}
          groups={groups}
          countBySlug={countBySlug}
          articlesWord={t.articles}
        />
      </div>

      <div className="mx-auto max-w-site px-4 pb-12 sm:px-6 lg:px-8">
        <div className="docs-card rounded-2xl border border-docs-border bg-docs-surface p-8">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <div className="text-3xl font-bold text-white">{totalCount}</div>
              <div className="mt-1 text-sm text-zinc-500">Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{groups.length}</div>
              <div className="mt-1 text-sm text-zinc-500">{t.sections}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{CATEGORIES.length}</div>
              <div className="mt-1 text-sm text-zinc-500">{t.topics}</div>
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
