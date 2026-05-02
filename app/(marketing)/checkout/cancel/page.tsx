'use client';

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center">
          {/* Cancel Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-palette-bgSecondary border border-palette-border">
            <svg
              className="w-10 h-10 text-palette-textMuted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-white">Payment Cancelled</h1>
          <p className="text-palette-textMuted mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full px-6 py-3 bg-palette-primary hover:bg-palette-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              View Plans
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-palette-bgSecondary hover:bg-palette-bgTertiary text-palette-textSecondary font-medium rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
