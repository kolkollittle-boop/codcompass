import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Choose Your Plan',
  description: 'Flexible pricing plans for developers. Start free, upgrade to Builder ($9.99/mo) or Pro ($29.99/mo) for unlimited access to all tutorials and features.',
  keywords: ['developer subscription', 'tech tutorials pricing', 'React courses', 'TypeScript courses', 'Next.js courses', 'developer tools pricing'],
  openGraph: {
    title: 'Pricing - Choose Your Plan',
    description: 'Flexible pricing plans for developers. Start free, upgrade to Builder ($9.99/mo) or Pro ($29.99/mo) for unlimited access.',
    url: 'https://www.codcompass.com/pricing',
    siteName: 'Codcompass',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Choose Your Plan',
    description: 'Flexible pricing plans for developers. Start free, upgrade to Builder ($9.99/mo) or Pro ($29.99/mo) for unlimited access.',
  },
};

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Access to 10% of articles',
        'Basic search functionality',
        'Weekly newsletter',
      ],
      cta: 'Get Started',
      mostPopular: false,
    },
    {
      name: 'Builder',
      price: '$9.99',
      description: 'Best for individual professionals',
      features: [
        'Full article access',
        'Advanced search',
        'Save articles for later',
        'Monthly newsletter',
        'Email support',
      ],
      cta: 'Start Free Trial',
      mostPopular: true,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For power users and teams',
      features: [
        'Everything in Builder',
        'Early access to new content',
        'Team collaboration',
        'Custom integrations',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      mostPopular: false,
    },
    {
      name: 'Enterprise',
      price: '$49',
      description: 'For organizations',
      features: [
        'Unlimited access',
        'Custom branding',
        'SSO Integration',
        'Dedicated account manager',
        '24/7 premium support',
      ],
      cta: 'Contact Sales',
      mostPopular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="py-12 bg-white sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
                Pricing Plans
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Choose the perfect plan for your knowledge needs
              </p>
            </div>

            <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-8">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-lg text-gray-500">
                Need custom solutions? Contact us for enterprise options.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}