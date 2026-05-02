'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <svg
              className="w-10 h-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-palette-bgSecondary rounded-lg animate-pulse w-48 mx-auto" />
              <div className="h-4 bg-palette-bgSecondary rounded-lg animate-pulse w-64 mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4 text-white">Payment Successful!</h1>
              <p className="text-palette-textMuted mb-8">
                Thank you for your subscription. Your account has been activated.
              </p>

              {sessionId && (
                <p className="text-xs text-palette-textMuted mb-8">
                  Session ID: {sessionId}
                </p>
              )}

              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="block w-full px-6 py-3 bg-palette-primary hover:bg-palette-primary-hover text-white font-medium rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full px-6 py-3 bg-palette-bgSecondary hover:bg-palette-bgTertiary text-palette-textSecondary font-medium rounded-lg transition-colors"
                >
                  View Plans
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
