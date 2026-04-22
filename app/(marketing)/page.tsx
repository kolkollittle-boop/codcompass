import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Premium Knowledge Base</span>
                <span className="block text-indigo-600 mt-2">For Developers & Professionals</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
                Access curated content, tutorials, and resources to accelerate your professional growth.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Pricing
                </Link>
                <Link
                  href="/kb"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Browse Knowledge Base
                </Link>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Curated Content</h3>
                <p className="mt-2 text-gray-500">
                  High-quality articles and tutorials reviewed by industry experts.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Expert Authors</h3>
                <p className="mt-2 text-gray-500">
                  Content from experienced professionals and thought leaders.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Always Updated</h3>
                <p className="mt-2 text-gray-500">
                  Fresh content added weekly to keep you current with trends.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}