import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** One persisted view row per user per article (sessionId is arbitrary). */
const VIEW_MARKER = 'article-open';

/**
 * Idempotent: records that this user opened the article (dashboard distinct read count).
 */
export async function ensureArticleViewRecorded(userId: string, articleId: string): Promise<void> {
  const exists = await prisma.articleView.findFirst({
    where: { articleId, userId },
    select: { id: true },
  });
  if (exists) return;

  try {
    await prisma.articleView.create({
      data: {
        articleId,
        userId,
        sessionId: VIEW_MARKER,
        readPercentage: 0,
        readTime: 0,
      },
    });
  } catch {
    // Race or missing Article FK
  }
}

export async function recordUserArticleViewIfAuthenticated(articleId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await ensureArticleViewRecorded(userId, articleId);
}
