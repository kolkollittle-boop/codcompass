
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function check() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, titleEn: true, publishedAt: true, createdAt: true }
  });
  
  console.log('=== LATEST 5 ARTICLES ===');
  for (const a of articles) {
    console.log('TITLE:', a.titleEn);
    console.log('CREATED AT:', a.createdAt.toISOString().split('T')[0]);
    console.log('PUBLISHED AT:', a.publishedAt ? a.publishedAt.toISOString().split('T')[0] : 'NULL');
    console.log('---');
  }
  await prisma.$disconnect();
}
check().catch(e => { console.error(e); process.exit(1); });
