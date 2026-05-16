import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCardV2, { type PricingPlanV2 } from '@/components/PricingCardV2';
import { Check, Shield, Clock, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Codcompass | Mid-Year Sale 🎉',
  description: 'Mid-Year Sale! Base $4.99/mo, Pro $14.99/mo. Limited-time pricing. 7-day trial on all plans.',
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
    name: 'Base',
    price: '$4.99',
    originalPrice: '$9.99',
    description: 'Full access to all 635+ curated tutorials and expert insights.',
    features: [
      'Full article access (KB + Blog)',
      'Advanced search & filtering',
      'Bookmark & save articles',
      'Monthly newsletter',
      'Email support',
    ],
    cta: 'Subscribe Now',
    ctaHref: '/checkout?plan=base&billing=yearly',
    icon: 'sparkles',
    valueProof: 'Less than a cup of coffee per month',
  },
  {
    name: 'Pro',
    price: '$14.99',
    originalPrice: '$29',
    description: 'AI-powered Q&A, code review, and everything in Base.',
    features: [
      'Everything in Base, plus:',
      'AI Q&A Assistant (RAG-powered)',
      'AI Code Review',
      'Early access to new content',
      'Priority support',
      'Production Bundle downloads',
    ],
    cta: 'Subscribe Now',
    ctaHref: '/checkout?plan=pro&billing=yearly',
    highlighted: true,
    badge: '🎉 Mid-Year Sale — 50% Off',
    icon: 'zap',
    valueProof: 'Save $30/year with yearly billing',
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
    <div className="flex min-h-screen flex-col text-palette-textSecondary">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 text-center sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(23,178,100,0.14),transparent)]" />
          <div className="relative z-10 mx-auto max-w-site">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400">
              <Clock className="h-4 w-4" />
              🎉 Mid-Year Sale — Save up to 50% — Limited Time
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-docs-heading sm:text-5xl lg:text-6xl">
              Simple, transparent
              <span className="bg-gradient-to-r from-docs-accent to-teal-400 bg-clip-text text-transparent"> pricing</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-docs-body sm:text-xl">
              Start learning today: 7-day free trial, no credit card; 30-day money-back guarantee; cancel anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-docs-muted">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-docs-accent" />
                7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-docs-accent" />
                30-day money-back
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-docs-accent" />
                Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-site mx-auto">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {pricingPlans.map((plan) => (
                <PricingCardV2 key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="border-y border-docs-border bg-docs-surface/50 px-4 py-24">
          <div className="mx-auto max-w-site text-center">
            <h2 className="mb-6 text-3xl font-bold text-docs-heading sm:text-4xl">Why developers choose Codcompass</h2>
            <p className="mb-12 text-lg text-docs-body">Thousands of developers use it for learning and production reference.</p>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="docs-card rounded-2xl border border-docs-border bg-docs-bg p-6">
                <div className="mb-2 text-4xl font-bold text-docs-accent">635+</div>
                <div className="text-sm text-docs-muted">Curated & refactored articles</div>
              </div>
              <div className="docs-card rounded-2xl border border-docs-border bg-docs-bg p-6">
                <div className="mb-2 text-4xl font-bold text-docs-accent">33</div>
                <div className="text-sm text-docs-muted">Technical categories</div>
              </div>
              <div className="docs-card rounded-2xl border border-docs-border bg-docs-bg p-6">
                <div className="mb-2 text-4xl font-bold text-docs-accent">4.9/5</div>
                <div className="text-sm text-docs-muted">User rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4">
          <div className="max-w-site mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold text-docs-heading sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-palette-textMuted">
                Everything you need to know about our pricing
              </p>
            </div>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="docs-card rounded-2xl border border-docs-border bg-docs-surface p-6"
                >
                  <h3 className="mb-3 text-lg font-semibold text-docs-heading">{faq.question}</h3>
                  <p className="leading-relaxed text-docs-body">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden px-4 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(23,178,100,0.12),transparent)]" />
          <div className="relative z-10 mx-auto max-w-site">
            <h2 className="mb-4 text-3xl font-bold text-docs-heading sm:text-4xl">Ready to level up?</h2>
            <p className="mb-8 text-lg text-docs-body">Start your 7-day free trial—no credit card required.</p>
            <a
              href="/kb"
              className="inline-flex items-center gap-2 rounded-md bg-docs-accent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-docs-accent-hover"
            >
              Browse the knowledge base
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
