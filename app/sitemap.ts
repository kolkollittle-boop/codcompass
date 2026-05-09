import { MetadataRoute } from 'next';
import { getPublishedBlogPostCards } from '@/lib/blog-queries';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.codcompass.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/kb`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/status`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // KB articles (from Supabase)
  let kbPages: MetadataRoute.Sitemap = [];
  try {
    if (supabaseAdmin) {
      const { data: articles, error } = await supabaseAdmin
        .from('Article')
        .select('slug, publishedAt')
        .eq('isPublished', true)
        .order('publishedAt', { ascending: false });
      
      if (error) {
        console.warn('[sitemap] Supabase error:', error);
      } else if (articles) {
        kbPages = articles.map((article: { slug: string; publishedAt: string | null }) => ({
          url: `${baseUrl}/en/kb/${article.slug}`,
          lastModified: new Date(article.publishedAt || new Date()),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (e) {
    console.warn('[sitemap] Failed to load KB articles:', e);
  }

  // Blog posts (from Prisma)
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedBlogPostCards();
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.warn('[sitemap] Failed to load blog posts:', e);
  }

  return [...staticPages, ...kbPages, ...blogPages];
}
