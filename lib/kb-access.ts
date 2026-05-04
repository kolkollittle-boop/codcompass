import { auth } from '@/lib/auth';
import { getSubscriptionPayloadForEmail } from '@/lib/subscription-for-email';

export type KbUserAccessLevel = 'free' | 'builder' | 'pro';

/**
 * Subscription tier for KB paywall (NextAuth session email + Paddle).
 * ADMIN is treated as full access.
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
  if (plan === 'builder') return 'builder';
  if (plan === 'pro' || plan === 'enterprise') return 'pro';
  return 'free';
}
