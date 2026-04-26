import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - Codcompass',
  description: 'Complete your subscription to access all premium tutorials and features.',
  robots: 'noindex',
};

const plans = [
  {
    id: 'builder',
    name: 'Builder',
    monthlyPrice: '$9.99/mo',
    yearlyPrice: '$79.99/yr',
    monthlySavings: '',
    yearlySavings: 'Save $39.89/year',
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
    monthlyPrice: '$29/mo',
    yearlyPrice: '$249/yr',
    monthlySavings: '',
    yearlySavings: 'Save $98/year',
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

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; billing?: string }>;
}) {
  const params = await searchParams;
  const selectedPlan = params?.plan || 'builder';
  const selectedBilling = params?.billing || 'monthly';
  
  const plan = plans.find(p => p.id === selectedPlan) || plans[0];
  const price = selectedBilling === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = selectedBilling === 'yearly' ? plan.yearlySavings : plan.monthlySavings;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600">Complete your subscription to unlock all features</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h2>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{price}</div>
                {savings && (
                  <div className="text-sm text-green-600 font-medium">{savings}</div>
                )}
              </div>
            </div>
            
            {/* Billing Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <a
                href={`/checkout?plan=${plan.id}&billing=monthly`}
                className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedBilling === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </a>
              <a
                href={`/checkout?plan=${plan.id}&billing=yearly`}
                className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedBilling === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly <span className="text-green-600 text-xs">(-33%)</span>
              </a>
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <form action="/api/checkout/create-session" method="POST" className="space-y-4">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="billing" value={selectedBilling} />
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="you@example.com"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              {/* Coupon */}
              <div>
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code (optional)
                </label>
                <input
                  type="text"
                  id="coupon"
                  name="coupon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="Enter code"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-lg"
              >
                Subscribe for {price}
              </button>

              {/* Security Note */}
              <p className="text-xs text-gray-500 text-center">
                🔒 Secure payment powered by Paddle. 30-day money-back guarantee.
              </p>
            </form>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Can I cancel anytime?</h3>
                <p className="text-sm text-gray-600 mt-1">Yes, you can cancel your subscription at any time from your account settings.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Is there a money-back guarantee?</h3>
                <p className="text-sm text-gray-600 mt-1">Yes, we offer a 30-day money-back guarantee. No questions asked.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Can I switch plans?</h3>
                <p className="text-sm text-gray-600 mt-1">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
