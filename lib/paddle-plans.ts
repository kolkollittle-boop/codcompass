/**
 * Paddle price ID → plan tier (matches env vars used by checkout).
 */

export type PaddlePlanKey = 'builder' | 'pro';

export function getPaddlePriceIdMap(): Record<PaddlePlanKey, Record<'monthly' | 'yearly', string>> {
  return {
    builder: {
      monthly: process.env.PADDLE_BUILDER_MONTHLY_PRICE_ID || '',
      yearly: process.env.PADDLE_BUILDER_YEARLY_PRICE_ID || '',
    },
    pro: {
      monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID || '',
      yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID || '',
    },
  };
}

/** Resolve plan + billing when webhook custom_data is empty. */
export function inferPlanFromPriceId(
  priceId: string | undefined | null
): { planType: string; billingCycle: string } | null {
  if (!priceId) return null;
  const map = getPaddlePriceIdMap();
  for (const plan of ['pro', 'builder'] as PaddlePlanKey[]) {
    for (const billing of ['monthly', 'yearly'] as const) {
      if (map[plan][billing] && map[plan][billing] === priceId) {
        return { planType: plan, billingCycle: billing };
      }
    }
  }
  return null;
}
