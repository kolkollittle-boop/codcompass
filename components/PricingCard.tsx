import Link from 'next/link';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  mostPopular: boolean;
  planId: string;
}

export default function PricingCard({ plan }: { plan: PricingPlan }) {
  const checkoutUrl = `/checkout?plan=${plan.planId}&billing=monthly`;

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 p-6 bg-palette-bgCard ${
        plan.mostPopular ? 'border-palette-primary shadow-cc-theme relative' : 'border-palette-border'
      }`}
    >
      {plan.mostPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-palette-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-palette-textPrimary">{plan.name}</h3>
        <p className="mt-1 text-sm text-palette-textMuted">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-palette-textPrimary">{plan.price}</span>
        <span className="text-palette-textMuted">/month</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <svg className="h-5 w-5 text-palette-success mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-palette-textSecondary">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={checkoutUrl as any}
        className={`block w-full text-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
          plan.mostPopular
            ? 'bg-palette-primary text-white hover:bg-palette-primary-hover'
            : 'bg-palette-bgSecondary text-palette-textPrimary hover:bg-palette-bgTertiary border border-palette-border'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
