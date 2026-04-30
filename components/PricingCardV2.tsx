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
      className={`relative flex flex-col rounded-2xl p-8 h-full transition-all duration-300 ${
        plan.highlighted
          ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]'
          : 'bg-zinc-900 border border-white/[0.08] hover:border-white/[0.15]'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-lg">
            <Icon className="w-3.5 h-3.5" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>

      {/* Plan Name & Description */}
      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
      <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>

      {/* Price */}
      <div className="mb-6 pb-6 border-b border-white/[0.08]">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white">{plan.price}</span>
          {plan.originalPrice && (
            <span className="text-lg text-zinc-500 line-through">{plan.originalPrice}</span>
          )}
          <span className="text-sm text-zinc-400">/month</span>
        </div>
        {plan.valueProof && (
          <p className="mt-2 text-xs text-green-400 font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {plan.valueProof}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={plan.ctaHref as any}
        className={`block w-full text-center py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
          plan.highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25'
            : 'bg-white/10 text-white hover:bg-white/15 border border-white/[0.08]'
        }`}
      >
        {plan.cta}
      </Link>

      {/* Refund Guarantee */}
      {plan.refundGuarantee && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Shield className="w-3.5 h-3.5" />
          30 天退款保证
        </div>
      )}
    </div>
  );
}

export type { PricingPlanV2 };
