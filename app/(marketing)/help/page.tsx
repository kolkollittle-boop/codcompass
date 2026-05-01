'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const faqs = [
  {
    question: 'How do I register a Codcompass account?',
    answer: 'Click the "Sign in" button in the top right corner, then select "Get Started" to create a free account. Fill in your email and password to complete registration.',
  },
  {
    question: 'What subscription plans are available?',
    answer: 'We offer 4 plans: Free (free), Builder ($9.99/month or $99/year), Pro ($29/month or $299/year), and Enterprise (custom pricing). See the pricing page for details.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'After logging in, go to Account Settings → Subscription Management → Cancel Subscription. After cancellation, you will continue to have access to premium content until the end of your current billing period.',
  },
  {
    question: 'What is the refund policy?',
    answer: 'We offer a 30-day money-back guarantee. If you are not satisfied within 30 days of subscription, you can request a full refund.',
  },
  {
    question: 'How often is content updated?',
    answer: 'We update technical articles weekly, covering React, TypeScript, Next.js, AI/ML, and DevOps.',
  },
  {
    question: 'Can I use it on multiple devices?',
    answer: 'Yes! One account can be used on up to 3 devices simultaneously.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Submit a contact form through the /contact page, or send an email to support@codcompass.com. We promise to reply within 24 hours.',
  },
  {
    question: 'Does it support Google login?',
    answer: 'Google OAuth login is coming soon. Currently, email registration is supported.',
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-600/20 via-zinc-900 to-purple-600/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Help Center
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Frequently asked questions and user guides
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/contact" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-shadow text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-bold text-white mb-2">Contact Us</h3>
              <p className="text-sm text-zinc-400">Have questions? Send an email or fill out the contact form</p>
            </Link>
            <Link href="/pricing" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-shadow text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-white mb-2">Pricing Plans</h3>
              <p className="text-sm text-zinc-400">View our subscription plans and features</p>
            </Link>
            <Link href={"/kb" as any} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-shadow text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-white mb-2">Knowledge Base</h3>
              <p className="text-sm text-zinc-400">Browse all technical tutorials and articles</p>
            </Link>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800"
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-zinc-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 text-zinc-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
