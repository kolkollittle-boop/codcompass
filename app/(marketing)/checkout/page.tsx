'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Script from 'next/script';

declare global {
  interface Window {
    Paddle?: any;
  }
}

const plans = [
  {
    id: 'builder',
    name: 'Builder',
    monthlyPrice: '$9.99',
    yearlyPrice: '$99',
    yearlySavings: 'Save $20.88/year',
    description: 'Full article access, advanced search, and more.',
    features: [
      'Full article access',
      'Advanced search & filtering',
      'Save articles for later',
      'Monthly newsletter',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: '$29',
    yearlyPrice: '$299',
    yearlySavings: 'Save $49/year',
    description: 'Everything in Builder, plus AI Q&A, code review, and team features.',
    features: [
      'Everything in Builder',
      'AI Q&A (RAG-powered)',
      'Code review with AI',
      'Early access to new content',
      'Team collaboration',
      'Priority support',
    ],
    popular: true,
  },
];

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams?.get('plan') || 'builder';
  const selectedBilling = searchParams?.get('billing') || 'yearly';
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = plans.find(p => p.id === selectedPlan) || plans[0];
  const price = selectedBilling === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = selectedBilling === 'yearly' ? plan.yearlySavings : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get price ID from API
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billing: selectedBilling,
          email,
          name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Open Paddle checkout using Paddle.js
      if (data.priceId && window.Paddle) {
        console.log('[Paddle] Opening checkout with priceId:', data.priceId);
        window.Paddle.Checkout.open({
          items: [{ priceId: data.priceId, quantity: 1 }],
          customer: { email, name: name || undefined },
          settings: {
            displayMode: 'overlay',
            theme: 'dark',
            locale: 'en',
          },
        });
      } else {
        console.error('[Paddle] Missing priceId or Paddle not loaded', { priceId: data.priceId, paddleLoaded: !!window.Paddle });
        throw new Error('No price ID returned or Paddle not loaded');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Load Paddle.js */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={() => {
          if (window.Paddle) {
            window.Paddle.Setup({
              token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
              environment: 'sandbox',
            });
            console.log('[Paddle] Initialized with sandbox environment');
          }
        }}
      />
      <Header />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
            <p className="mt-2 text-zinc-400">Complete your subscription to unlock all features</p>
          </div>

          {/* Order Summary */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{plan.name} Plan</h2>
                <p className="text-sm text-zinc-400">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{price}</div>
                {savings && (
                  <div className="text-sm text-green-400 font-medium">{savings}</div>
                )}
              </div>
            </div>
            
            {/* Billing Toggle */}
            <div className="flex bg-zinc-800 rounded-lg p-1 mb-4">
              <a
                href={`/checkout?plan=${plan.id}&billing=monthly`}
                className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedBilling === 'monthly'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </a>
              <a
                href={`/checkout?plan=${plan.id}&billing=yearly`}
                className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedBilling === 'yearly'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-green-400 text-xs">(-33%)</span>
              </a>
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-zinc-400">
                  <svg className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout Form */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-zinc-800 text-white placeholder-zinc-500"
                  placeholder="you@example.com"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-zinc-800 text-white placeholder-zinc-500"
                  placeholder="John Doe"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Subscribe for ${price}`}
              </button>

              {/* Security Note */}
              <p className="text-xs text-zinc-500 text-center">
                🔒 Secure payment powered by Paddle. 30-day money-back guarantee.
              </p>
            </form>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white">Can I cancel anytime?</h3>
                <p className="text-sm text-zinc-400 mt-1">Yes, you can cancel your subscription at any time from your account settings.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Is there a money-back guarantee?</h3>
                <p className="text-sm text-zinc-400 mt-1">Yes, we offer a 30-day money-back guarantee. No questions asked.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Can I switch plans?</h3>
                <p className="text-sm text-zinc-400 mt-1">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
