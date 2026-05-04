import Link from 'next/link';
import { Icon } from '@/components/ui';
import type { KbBrowseGroup } from '@/lib/kb-nav-tree';
import { cn } from '@/lib/utils';

export function KbCategoriesTieredList({
  locale,
  groups,
  countBySlug,
  articlesWord,
}: {
  locale: string;
  groups: KbBrowseGroup[];
  countBySlug: Record<string, number>;
  articlesWord: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {groups.map((g) => {
        const totalArticles = g.topics.reduce((sum, topic) => sum + (countBySlug[topic.slug] ?? 0), 0);
        const topicWord = g.topics.length === 1 ? 'topic' : 'topics';

        return (
          <details
            key={g.id}
            className={cn(
              'group/details min-w-0 docs-card rounded-2xl border border-docs-border bg-docs-surface',
            )}
            open={g.defaultOpen}
          >
            <summary
              className={cn(
                'flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden',
                '[&::-webkit-details-marker]:hidden',
              )}
            >
              <div className="min-w-0 text-left">
                <h2 className="text-lg font-semibold text-white">{g.label}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {totalArticles} {articlesWord} · {g.topics.length} {topicWord}
                </p>
              </div>
              <Icon
                name="chevron-down"
                size={20}
                className="shrink-0 text-zinc-500 transition-transform duration-200 group-open/details:rotate-180"
              />
            </summary>

            <div className="border-t border-docs-border px-5 pb-5 pt-1">
              <ul className="space-y-1 pt-3">
                {g.topics.map((topic) => {
                  const n = countBySlug[topic.slug] ?? 0;
                  return (
                    <li key={topic.slug}>
                      <Link
                        href={`/${locale}/kb/categories/${topic.slug}` as never}
                        className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                      >
                        <span className="min-w-0 truncate">{topic.label}</span>
                        <span className="shrink-0 tabular-nums text-zinc-500">
                          {n} {articlesWord}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </details>
        );
      })}
    </div>
  );
}
