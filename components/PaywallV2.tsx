import Link from 'next/link';
import { Lock, Sparkles, Zap, Shield } from 'lucide-react';

interface PaywallV2Props {
  variant?: 'inline' | 'overlay' | 'card';
  locale?: string;
  // A/B 测试文案版本
  copyVersion?: 'A' | 'B' | 'C';
  // 自定义文案
  title?: string;
  description?: string;
  ctaText?: string;
}

const copyTemplates = {
  A: {
    title: 'Efficiency Upgrade',
    description: 'You\'ve seen how Hybrid Search improves retrieval accuracy by 27%. The core code below shows how to achieve this with just 3 lines of configuration, plus production tuning parameters. Upgrade to Pro and take the Blueprint with you.',
    cta: 'Upgrade Pro, Get the Blueprint',
  },
  B: {
    title: 'Cost Optimization',
    description: 'At 100GB scale, wrong indexing strategies waste memory every hour. Unlock the "Index Sharding & Memory Optimization" section to reduce your running costs by 40%.',
    cta: 'Upgrade Pro, Save 40% Costs',
  },
  C: {
    title: 'Results-Driven',
    description: 'The key to reducing hallucination by 35% lies in the Re-ranking weight matrix and dynamic tuning code below. Stop letting garbage data pollute your context window and company budget. Upgrade to Pro for the complete production-grade implementation + Blueprint (docker-compose + benchmark scripts).',
    cta: 'Upgrade Pro, Get Full Implementation',
  },
};

export default function PaywallV2({
  variant = 'overlay',
  locale = 'en',
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
    A: <Zap className="w-7 h-7" />,
    B: <Shield className="w-7 h-7" />,
    C: <Sparkles className="w-7 h-7" />,
  };

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 p-8 my-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">Unlock Full Access</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            {displayDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              {displayCta}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              Already subscribed? Sign in
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 my-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5" /> {displayTitle}
            </h3>
            <p className="text-cyan-100 text-sm">
              {displayDescription.slice(0, 80)}...
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 px-6 py-2.5 bg-white text-cyan-700 font-medium rounded-lg hover:bg-cyan-50 transition-colors"
          >
            {displayCta}
          </Link>
        </div>
      </div>
    );
  }

  // Default: overlay (for blurring premium content)
  return (
    <div className="relative my-10">
      {/* Blurred preview */}
      <div className="blur-md select-none pointer-events-none opacity-30" aria-hidden="true">
        <div className="prose prose-lg max-w-none prose-invert">
          <p>This is premium content that requires a subscription to view.</p>
          <p>Subscribe to unlock full access to all articles.</p>
        </div>
      </div>

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent w-full h-full flex items-end sm:items-center justify-center pb-8 sm:pb-0">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {icons[copyVersion]}
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">{displayTitle}</h3>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              {displayDescription}
            </p>
            <Link
              href="/pricing"
              className="block w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              {displayCta}
            </Link>
            <p className="text-xs text-zinc-500 mt-3">
              Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
