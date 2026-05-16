import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { auth } from '@/lib/auth';
import { getPublishedBlogPostBySlug } from '@/lib/blog-queries';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';

/** Avoid build-time Prisma against DB (tables may not exist until `prisma migrate deploy`). */
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: 'Blog | Codcompass' };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const session = await auth();
  const isMember = !!session?.user;

  const safe = sanitizeBlogHtml(post.contentHtml);
  const dateStr = post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : '';

  return (
    <div className="flex min-h-screen flex-col bg-docs-bg text-docs-body">
      <Header />
      <main className="flex-grow">
        <article className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-8 inline-block text-sm font-medium text-docs-accent hover:text-docs-accent-hover"
          >
            ← Back to Blog
          </Link>

          <header className="mb-10 border-b border-docs-border pb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-docs-border bg-docs-surface px-3 py-1 text-sm font-medium text-docs-heading">
                {post.category.name}
              </span>
              {dateStr ? <span className="text-sm text-docs-muted">{dateStr}</span> : null}
              {dateStr ? <span className="text-sm text-docs-muted">·</span> : null}
              <span className="text-sm text-docs-muted">{post.readingMinutes} min read</span>
              {!isMember && (
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  Members Only
                </span>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold text-docs-heading sm:text-4xl">{post.title}</h1>
            {post.author ? (
              <div className="flex items-center text-sm text-docs-muted">
                <span>By {post.author}</span>
              </div>
            ) : null}
          </header>

          {isMember ? (
            <div
              className="prose prose-lg prose-invert max-w-none prose-headings:font-bold prose-headings:text-docs-heading prose-p:text-docs-body prose-p:leading-relaxed prose-a:text-docs-accent prose-code:text-docs-secondary prose-code:bg-docs-code prose-li:text-docs-body prose-pre:bg-docs-code prose-pre:border prose-pre:border-docs-border"
              dangerouslySetInnerHTML={{ __html: safe }}
            />
          ) : (
            <div className="relative">
              <div
                className="prose prose-lg prose-invert max-w-none blur-sm select-none pointer-events-none opacity-40 prose-headings:font-bold prose-headings:text-docs-heading prose-p:text-docs-body prose-p:leading-relaxed prose-a:text-docs-accent prose-code:text-docs-secondary prose-code:bg-docs-code prose-li:text-docs-body prose-pre:bg-docs-code prose-pre:border prose-pre:border-docs-border"
                dangerouslySetInnerHTML={{ __html: safe }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-docs-bg via-docs-bg/90 to-transparent">
                <div className="text-center max-w-md px-6">
                  <div className="mb-4 text-4xl">🎉</div>
                  <h3 className="mb-2 text-xl font-semibold text-docs-heading">Mid-Year Sale — Unlock Full Article</h3>
                  <p className="mb-2 text-docs-body">Base plan from just <span className="text-white font-bold">$4.99/mo</span> or <span className="text-white font-bold">$49/yr</span></p>
                  <p className="mb-6 text-docs-muted">Sign in to read the full article and unlock all tutorials.</p>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg bg-docs-accent px-6 py-2.5 font-medium text-docs-bg shadow-lg shadow-docs-accent/20 transition hover:bg-docs-accent-hover"
                  >
                    Sign In / Register — Start Free Trial
                  </Link>
                  <p className="mt-3 text-xs text-docs-faint">7-day free trial · Cancel anytime · 30-day money-back</p>
                </div>
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
