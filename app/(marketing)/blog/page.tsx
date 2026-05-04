import type { Metadata } from 'next';
import { BlogListClient } from '@/components/blog/BlogListClient';
import { getBlogCategoriesForNav, getPublishedBlogPostCards } from '@/lib/blog-queries';

/** Avoid build-time Prisma against DB (tables may not exist until `prisma migrate deploy`). */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | Codcompass',
  description:
    'Practitioner experiences and lessons learned—informal field notes, separate from the structured Knowledge Base.',
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedBlogPostCards(),
    getBlogCategoriesForNav(),
  ]);

  return <BlogListClient posts={posts} categories={categories} />;
}
