import Link from 'next/link';
import { Check, Sparkles, Zap, Shield, Building2 } from 'lucide-react';

interface PricingPlanV2 {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  icon: 'sparkles' | 'zap' | 'shield' | 'building';
  valueProof?: string;
  refundGuarantee?: boolean;
}

const iconMap = {
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  building: Building2,
};

export default function PricingCardV2({ plan }: { plan: PricingPlanV2 }) {
  const Icon = iconMap[plan.icon];

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 ${
        plan.highlighted
          ? 'border-docs-accent/40 bg-gradient-to-br from-docs-accent/10 to-teal-900/10 shadow-lg shadow-docs-accent/10 ring-1 ring-docs-accent/25'
          : 'border-docs-border bg-docs-surface hover:border-docs-border-hover'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-docs-accent px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
            <Icon className="w-3.5 h-3.5" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-docs-accent" />
      </div>

      {/* Plan Name & Description */}
      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
      <p className="mb-6 text-sm text-zinc-400">{plan.description}</p>

      {/* Price */}
      <div className="mb-6 border-b border-docs-border pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white">{plan.price}</span>
          {plan.originalPrice && (
            <span className="text-lg text-zinc-500 line-through">{plan.originalPrice}</span>
          )}
          <span className="text-sm text-zinc-500">/month</span>
        </div>
        {plan.valueProof && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-docs-accent">
            <Check className="w-3.5 h-3.5" />
            {plan.valueProof}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-docs-accent" />
            <span className="text-sm text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={plan.ctaHref as any}
        className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-medium transition-all duration-200 ${
          plan.highlighted
            ? 'bg-docs-accent text-white shadow-md shadow-docs-accent/20 hover:bg-docs-accent-hover'
            : 'border border-docs-border bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        {plan.cta}
      </Link>

      {/* Refund Guarantee */}
      {plan.refundGuarantee && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Shield className="w-3.5 h-3.5" />
          30-day money-back guarantee
        </div>
      )}
    </div>
  );
}

export type { PricingPlanV2 };
