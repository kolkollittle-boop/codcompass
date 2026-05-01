'use client';

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center">
          {/* Cancel Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700">
            <svg
              className="w-10 h-10 text-zinc-400"
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
          <p className="text-zinc-400 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              View Plans
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
