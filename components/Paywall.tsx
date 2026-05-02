import Link from 'next/link';
import { Icon } from './ui';

interface PaywallProps {
  price?: string;
  href?: '/pricing' | '/login';
  variant?: 'inline' | 'overlay' | 'card';
}

export default function Paywall({
  price = '$9.99/mo',
  href = '/pricing' as const,
  variant = 'overlay',
}: PaywallProps) {
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-palette-bgCard to-palette-bgSecondary rounded-2xl border border-palette-border p-8 my-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-palette-bgTertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lock" size={32} className="text-palette-primary" />
          </div>
          <h3 className="text-2xl font-bold text-palette-textPrimary mb-2">Unlock Full Access</h3>
          <p className="text-palette-textMuted mb-6 max-w-md mx-auto">
            Get unlimited access to all premium tutorials, code examples, and expert insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={href}
              className="px-8 py-3 bg-palette-primary hover:bg-palette-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              Subscribe from {price}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-palette-bgSecondary hover:bg-palette-bgTertiary text-palette-textSecondary font-medium rounded-lg border border-palette-border transition-colors"
            >
              Already subscribed? Sign in
            </Link>
          </div>
          <p className="text-xs text-palette-textMuted mt-4">
            Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl p-6 my-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">
              <Icon name="lock" size={16} className="inline mr-1" /> Premium Content
            </h3>
            <p className="text-sm text-white/85">
              Subscribe to unlock this article and all premium content
            </p>
          </div>
          <Link
            href={href}
            className="flex-shrink-0 px-6 py-2.5 bg-white text-palette-primary font-medium rounded-lg hover:bg-palette-bgTertiary transition-colors"
          >
            Upgrade for {price}
          </Link>
        </div>
      </div>
    );
  }

  // Default: overlay (for blurring premium content)
  return (
    <div className="relative mt-10">
      {/* Blurred preview */}
      <div className="blur-md select-none pointer-events-none opacity-30" aria-hidden="true">
        <div className="prose prose-lg max-w-none">
          <p>This is premium content that requires a subscription to view.</p>
          <p>Subscribe to unlock full access to all articles.</p>
        </div>
      </div>

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-to-t from-palette-bgPrimary via-palette-bgPrimary to-transparent w-full h-full flex items-end sm:items-center justify-center pb-8 sm:pb-0">
          <div className="bg-palette-bgCard rounded-2xl border border-palette-border shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-14 h-14 bg-palette-bgTertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="lock" size={28} className="text-palette-primary" />
            </div>
            <h3 className="text-xl font-bold text-palette-textPrimary mb-2">Unlock Full Article</h3>
            <p className="text-palette-textMuted mb-6">
              Get unlimited access to all premium tutorials, code examples, and expert insights.
            </p>
            <Link
              href={href}
              className="block w-full py-3 px-6 bg-palette-primary hover:bg-palette-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              Subscribe from {price}
            </Link>
            <p className="text-xs text-palette-textMuted mt-3">
              Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
