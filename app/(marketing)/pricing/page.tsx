import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCardV2, { type PricingPlanV2 } from '@/components/PricingCardV2';
import { Check, Shield, Clock, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Codcompass',
  description: 'Flexible pricing plans for developers. Start with 7-day trial, upgrade to Pro ($15/mo), Team ($49/mo) or Enterprise for unlimited access.',
  keywords: ['developer subscription', 'tech tutorials pricing', 'AI knowledge base', 'developer tools pricing'],
  openGraph: {
    title: 'Pricing - Codcompass',
    description: 'Flexible pricing plans for developers. Start with 7-day trial.',
    url: 'https://www.codcompass.com/pricing',
    siteName: 'Codcompass',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Codcompass',
    description: 'Flexible pricing plans for developers. Start with 7-day trial.',
  },
};

const pricingPlans: PricingPlanV2[] = [
  {
    name: 'Builder',
    price: '$9.9',
    description: 'For individual developers who want full access to tutorials and expert insights.',
    features: [
      'Full article access',
      'Advanced search & filtering',
      'Save articles for later',
      'Monthly newsletter',
      'Email support',
    ],
    cta: 'Subscribe Now',
    ctaHref: '/checkout?plan=builder&billing=yearly',
    icon: 'sparkles',
    valueProof: 'Save 10+ hours/week on research',
  },
  {
    name: 'Pro',
    price: '$29.9',
    description: 'For developers who need AI-powered tools and team collaboration features.',
    features: [
      'Everything in Builder, plus:',
      'AI Q&A (RAG-powered)',
      'Code review with AI',
      'Early access to new content',
      'Team collaboration',
      'Priority support',
    ],
    cta: 'Subscribe Now',
    ctaHref: '/checkout?plan=pro&billing=yearly',
    highlighted: true,
    badge: 'Most Popular',
    icon: 'zap',
    valueProof: 'Save $98/year with yearly billing',
    refundGuarantee: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations that need custom solutions, SSO, and dedicated support.',
    features: [
      'Everything in Pro, plus:',
      'Unlimited team members',
      'SSO / SAML integration',
      'Custom branding',
      'Dedicated account manager',
      '24/7 premium support',
      'Custom content requests',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    icon: 'building',
    valueProof: 'Tailored to your organization',
  },
];

const faqData = [
  {
    question: 'What happens after my 7-day trial?',
    answer: 'After your trial ends, you\'ll be automatically subscribed to the plan you chose. You can cancel anytime before the trial ends and won\'t be charged.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your billing period.',
  },
  {
    question: 'How does the 30-day money-back guarantee work?',
    answer: 'If you\'re not satisfied with your subscription within the first 30 days, contact us for a full refund. No questions asked.',
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at the next billing date.',
  },
  {
    question: 'Do you offer discounts for startups or education?',
    answer: 'Yes! We offer 50% off for verified startups (less than 2 years old, under 10 employees) and educational institutions. Contact us to apply.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. For Enterprise plans, we also support invoice-based billing.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-neutral-200">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl opacity-30" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-6">
              <Clock className="w-4 h-4" />
              Limited: 7-Day Free Trial on All Plans
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
              Start learning today with a 7-day free trial. No credit card required.
              Cancel anytime with our 30-day money-back guarantee.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                30-day money-back guarantee
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {pricingPlans.map((plan) => (
                <PricingCardV2 key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Why Developers Choose Codcompass
            </h2>
            <p className="text-lg text-neutral-400 mb-12">
              Join thousands of developers who trust Codcompass for their technical learning
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl">
                <div className="text-4xl font-bold text-indigo-400 mb-2">10K+</div>
                <div className="text-sm text-neutral-400">Articles Curated</div>
              </div>
              <div className="p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl">
                <div className="text-4xl font-bold text-indigo-400 mb-2">25K+</div>
                <div className="text-sm text-neutral-400">Monthly Readers</div>
              </div>
              <div className="p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl">
                <div className="text-4xl font-bold text-indigo-400 mb-2">4.9/5</div>
                <div className="text-sm text-neutral-400">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-neutral-400">
                Everything you need to know about our pricing
              </p>
            </div>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-30" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              Start your 7-day free trial today. No credit card required.
            </p>
            <a
              href="/kb"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all"
            >
              Browse Articles
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
