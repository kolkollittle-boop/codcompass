import Link from 'next/link';
import { Lock, Sparkles, Zap, Shield } from 'lucide-react';

interface PaywallV2Props {
  variant?: 'inline' | 'overlay' | 'card';
  locale?: string;
  copyVersion?: 'A' | 'B' | 'C';
  title?: string;
  description?: string;
  ctaText?: string;
}

const copyTemplates = {
  A: {
    title: 'Efficiency Upgrade',
    description:
      "You've seen how Hybrid Search improves retrieval accuracy by 27%. The core code below shows how to achieve this with just 3 lines of configuration, plus production tuning parameters. Upgrade to Pro and take the Blueprint with you.",
    cta: 'Upgrade Pro, Get the Blueprint',
  },
  B: {
    title: 'Cost Optimization',
    description:
      'At 100GB scale, wrong indexing strategies waste memory every hour. Unlock the "Index Sharding & Memory Optimization" section to reduce your running costs by 40%.',
    cta: 'Upgrade Pro, Save 40% Costs',
  },
  C: {
    title: 'Results-Driven',
    description:
      'The key to reducing hallucination by 35% lies in the Re-ranking weight matrix and dynamic tuning code below. Stop letting garbage data pollute your context window and company budget. Upgrade to Pro for the complete production-grade implementation + Blueprint (docker-compose + benchmark scripts).',
    cta: 'Upgrade Pro, Get Full Implementation',
  },
};

export default function PaywallV2({
  variant = 'overlay',
  locale: _locale = 'en',
  copyVersion = 'C',
  title,
  description,
  ctaText,
}: PaywallV2Props) {
  const copy = copyTemplates[copyVersion];
  const displayTitle = title || copy.title;
  const displayDescription = description || copy.description;
  const displayCta = ctaText || copy.cta;

  const icons = {
    A: <Zap className="h-7 w-7" />,
    B: <Shield className="h-7 w-7" />,
    C: <Sparkles className="h-7 w-7" />,
  };

  if (variant === 'card') {
    return (
      <div className="docs-card my-8 rounded-2xl border border-docs-border bg-docs-surface p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-docs-bg">
            <Lock className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white">Unlock Full Access</h3>
          <p className="mx-auto mb-6 max-w-md text-zinc-500">{displayDescription}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-zinc-200"
            >
              {displayCta}
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-docs-border bg-docs-bg px-8 py-3 font-medium text-zinc-300 transition-colors hover:border-docs-border-hover hover:text-white"
            >
              Already subscribed? Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Cancel anytime · 30-day money-back guarantee</p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="my-8 rounded-xl border border-docs-border bg-docs-surface p-6 text-white">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold">
              <Lock className="h-5 w-5" /> {displayTitle}
            </h3>
            <p className="text-sm text-zinc-400">{displayDescription.slice(0, 80)}...</p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 rounded-lg bg-white px-6 py-2.5 font-medium text-black transition-colors hover:bg-zinc-200"
          >
            {displayCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative my-10">
      <div className="pointer-events-none select-none opacity-30 blur-md" aria-hidden="true">
        <div className="prose prose-lg max-w-none prose-invert">
          <p>This is premium content that requires a subscription to view.</p>
          <p>Subscribe to unlock full access to all articles.</p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-full w-full items-end justify-center bg-gradient-to-t from-docs-bg via-docs-bg/90 to-transparent pb-8 sm:items-center sm:pb-0">
          <div className="docs-card mx-4 max-w-md rounded-2xl border border-docs-border bg-docs-surface p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-docs-bg text-zinc-200">
              {icons[copyVersion]}
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">{displayTitle}</h3>
            <p className="mb-6 text-sm leading-relaxed text-zinc-500">{displayDescription}</p>
            <Link
              href="/pricing"
              className="block w-full rounded-lg bg-white py-3 px-6 font-medium text-black transition-colors hover:bg-zinc-200"
            >
              {displayCta}
            </Link>
            <p className="mt-3 text-xs text-zinc-600">Cancel anytime · 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
