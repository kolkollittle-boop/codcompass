import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Icon } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Codcompass - Premium Knowledge Base for Developers',
  description: 'Master modern web development with curated tutorials on React, TypeScript, Next.js, AI/ML, and DevOps. Production-ready code examples updated weekly.',
  keywords: ['React tutorials', 'TypeScript guides', 'Next.js framework', 'AI development', 'DevOps tutorials', 'code examples'],
  openGraph: {
    title: 'Codcompass - Premium Knowledge Base for Developers',
    description: 'Master modern web development with curated tutorials on React, TypeScript, Next.js, AI/ML, and DevOps.',
    url: 'https://www.codcompass.com',
    siteName: 'Codcompass',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codcompass - Premium Knowledge Base for Developers',
    description: 'Master modern web development with curated tutorials on React, TypeScript, Next.js, AI/ML, and DevOps.',
    images: ['/og-image.png'],
  },
};

const features = [
  {
    icon: 'book-marked' as const,
    title: 'Curated Technical Content',
    desc: 'No fluff. Every article is reviewed for accuracy and practical value.',
  },
  {
    icon: 'code' as const,
    title: 'Production-Ready Code',
    desc: 'All code examples come from real projects, not toy examples.',
  },
  {
    icon: 'refresh' as const,
    title: 'Updated Weekly',
    desc: 'Fresh content on the latest frameworks, tools, and best practices.',
  },
];

const stats = [
  { value: '50+', label: 'Articles' },
  { value: '12', label: 'Topics' },
  { value: '4.8', label: 'Avg Rating' },
  { value: 'Weekly', label: 'Updates' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50/50 to-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              Level Up Your
              <span className="block text-indigo-600 mt-2">Development Skills</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Premium tutorials and expert insights for developers who want to build better software. No fluff, just practical knowledge.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={"/kb" as any}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Icon name="book" size={20} />
                Browse Articles
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View Pricing
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Why Developers Choose Codcompass</h2>
              <p className="mt-4 text-lg text-gray-600">Quality content that actually helps you build better software.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div key={f.title} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                    <Icon name={f.icon} size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsletterSignup />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">Start Learning Today</h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Get unlimited access to all tutorials, code examples, and expert insights for just $9.99/month.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
            >
              Get Started
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
