import type { Metadata } from 'next';
import { BlogListClient } from '@/components/blog/BlogListClient';
import { getBlogCategoriesForNav, getPublishedBlogPostCards } from '@/lib/blog-queries';

export const revalidate = 120;

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
