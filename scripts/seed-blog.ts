#!/usr/bin/env node
/**
 * Upsert marketing blog categories & posts (tables BlogCategory / BlogPost).
 * Requires DATABASE_URL. Does not touch KB Article / Category.
 *
 * Usage: npx tsx scripts/seed-blog.ts
 */
import { PrismaClient } from '@prisma/client';
import { BLOG_SEED_CATEGORIES, BLOG_SEED_POSTS } from './blog-seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Blog seed: upserting BlogCategory…');
  const catIdBySlug = new Map<string, string>();

  for (const c of BLOG_SEED_CATEGORIES) {
    const row = await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        nameEn: c.nameEn,
        sortOrder: c.sortOrder,
      },
      update: {
        name: c.name,
        nameEn: c.nameEn,
        sortOrder: c.sortOrder,
      },
    });
    catIdBySlug.set(c.slug, row.id);
    console.log(`  ✓ ${c.slug}`);
  }

  console.log('Blog seed: upserting BlogPost…');
  for (const p of BLOG_SEED_POSTS) {
    const categoryId = catIdBySlug.get(p.categorySlug);
    if (!categoryId) {
      console.error(`  ✗ missing category ${p.categorySlug} for ${p.slug}`);
      continue;
    }
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        contentHtml: p.contentHtml,
        excerpt: p.excerpt,
        author: p.author,
        readingMinutes: p.readingMinutes,
        tags: [...p.tags],
        isPublished: true,
        publishedAt: new Date(p.publishedAtIso),
        categoryId,
      },
      update: {
        title: p.title,
        contentHtml: p.contentHtml,
        excerpt: p.excerpt,
        author: p.author,
        readingMinutes: p.readingMinutes,
        tags: [...p.tags],
        isPublished: true,
        publishedAt: new Date(p.publishedAtIso),
        categoryId,
      },
    });
    console.log(`  ✓ ${p.slug}`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
