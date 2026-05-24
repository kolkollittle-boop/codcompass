import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference - Codcompass',
  description: 'Complete API documentation for codcompass.com — endpoints, authentication, request/response formats, and usage examples.',
};

const CATEGORY_LABELS: Record<string, string> = {
  'api-admin': 'Admin',
  'api-user': 'User',
  'api-ingestion': 'Ingestion',
  'api-payments': 'Payments',
  'api-ai': 'AI',
  'api-newsletter': 'Newsletter',
  'api-internal': 'Internal',
  'api-series': 'Series',
  'api-content': 'Content',
};

interface ApiArticle {
  id: string;
  slug: string;
  titleEn: string;
  excerptEn: string | null;
  sourceSite: string | null;
  publishedAt: string | null;
  tags: any[];
}

async function getApiArticles(): Promise<ApiArticle[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('Article')
    .select(`
      id,
      slug,
      titleEn,
      excerptEn,
      sourceSite,
      publishedAt,
      tags:Tag(name)
    `)
    .eq('isPublished', true)
    .eq('sourceSite', 'api-reference')
    .order('publishedAt', { ascending: false });

  if (error) {
    console.error('[ApiReference] Error:', error);
    return [];
  }
  return data || [];
}

function extractCategory(article: ApiArticle): string {
  const tagNames = (article.tags || [])
    .flat()
    .map((t: any) => t?.name)
    .filter(Boolean);
  for (const name of tagNames) {
    if (name.startsWith('api-')) return name;
  }
  return 'api-content';
}

export default async function ApiReferencePage() {
  const articles = await getApiArticles();

  const grouped = new Map<string, ApiArticle[]>();
  for (const article of articles) {
    const cat = extractCategory(article);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(article);
  }

  return (
    <div className="flex min-h-0 flex-col text-zinc-400">
      <div className="border-b border-docs-border bg-docs-surface py-16 text-white">
        <div className="mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold">API Reference</h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-400">
            Complete API documentation for codcompass.com — endpoints, authentication, request/response formats, and usage examples.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-docs-border bg-docs-surface p-12 text-center">
            <p className="text-lg text-zinc-400">
              No API documentation articles yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Array.from(grouped.entries()).map(([catSlug, catArticles]) => (
              <section key={catSlug}>
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {CATEGORY_LABELS[catSlug] || catSlug.replace('api-', '').replace(/^./, c => c.toUpperCase())}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catArticles.map(article => (
                    <Link
                      key={article.id}
                      href={`/kb/${article.slug}` as any}
                      className="group rounded-xl border border-docs-border bg-docs-surface p-6 transition-colors hover:border-docs-accent/50 hover:bg-docs-surface/80"
                    >
                      <h3 className="mb-2 text-base font-semibold text-docs-heading group-hover:text-docs-accent">
                        {article.titleEn}
                      </h3>
                      {article.excerptEn && (
                        <p className="line-clamp-2 text-sm text-docs-secondary">
                          {article.excerptEn}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-docs-border bg-docs-surface p-8">
          <h3 className="mb-4 text-xl font-bold text-white">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-white">{articles.length}</div>
              <div className="mt-1 text-sm text-zinc-500">API Endpoints</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{grouped.size}</div>
              <div className="mt-1 text-sm text-zinc-500">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">REST</div>
              <div className="mt-1 text-sm text-zinc-500">API Style</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">JSON</div>
              <div className="mt-1 text-sm text-zinc-500">Response Format</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
