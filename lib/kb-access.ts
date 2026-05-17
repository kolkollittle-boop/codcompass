import { auth } from '@/lib/auth';
import { getSubscriptionPayloadForEmail } from '@/lib/subscription-for-email';

export type KbUserAccessLevel = 'free' | 'base' | 'pro';

/**
 * Subscription tier for KB paywall (NextAuth session email + Paddle).
 * ADMIN is treated as full access.
 *
 * Tiers: free (no sub), base (full article access), pro (base + AI features)
 */
export async function getKbUserAccessLevel(): Promise<KbUserAccessLevel> {
  const session = await auth();
  if (!session?.user) return 'free';
  if ((session.user as { role?: string }).role === 'ADMIN') return 'pro';

  const email = session.user.email?.trim();
  if (!email) return 'free';

  const payload = await getSubscriptionPayloadForEmail(email);
  if (!payload.subscription) return 'free';

  const plan = (payload.plan || 'FREE').toLowerCase();
  if (plan === 'base' || plan === 'builder') return 'base';
  if (plan === 'pro' || plan === 'enterprise') return 'pro';
  return 'free';
}
