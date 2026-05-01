import Link from 'next/link';
import { Icon } from './ui';

interface PaywallProps {
  price?: string;
  href?: '/pricing' | '/login';
  variant?: 'inline' | 'overlay' | 'card';
}

export default function Paywall({ 
  price = '$9.9/mo',
  href = '/pricing' as const,
  variant = 'overlay'
}: PaywallProps) {
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8 my-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lock" size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Full Access</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get unlimited access to all premium tutorials, code examples, and expert insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={href}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe from {price}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
            >
              Already subscribed? Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 my-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1"><Icon name="lock" size={16} className="inline mr-1" /> Premium Content</h3>
            <p className="text-indigo-100 text-sm">
              Subscribe to unlock this article and all premium content
            </p>
          </div>
          <Link
            href={href}
            className="flex-shrink-0 px-6 py-2.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
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
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent w-full h-full flex items-end sm:items-center justify-center pb-8 sm:pb-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="lock" size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Article</h3>
            <p className="text-gray-600 mb-6">
              Get unlimited access to all premium tutorials, code examples, and expert insights.
            </p>
            <Link
              href={href}
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe from {price}
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
