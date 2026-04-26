import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                About Codcompass
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A knowledge base platform providing high-quality technical tutorials and expert insights for developers
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                In an era of information overload, developers face a flood of content but varying quality. Codcompass is dedicated to:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="book-marked" size={16} className="inline text-indigo-600 mr-1" /> Curating high-quality technical content, rejecting information noise</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="code" size={16} className="inline text-indigo-600 mr-1" /> Providing production-ready code examples from real projects</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="refresh" size={16} className="inline text-indigo-600 mr-1" /> Weekly updates on the latest frameworks, tools, and best practices</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="target" size={16} className="inline text-indigo-600 mr-1" /> Focusing on modern tech stacks like React, TypeScript, Next.js</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Icon name="compass" size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Codcompass</h3>
                <p className="text-gray-600">Code + Compass = Developer's Compass</p>
                <p className="text-gray-500 mt-2">Navigating your technical growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
                <div className="text-gray-600">Technical Articles</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">12</div>
                <div className="text-gray-600">Tech Topics</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">4.8</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">Weekly</div>
                <div className="text-gray-600">Continuous Updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Team</h2>
            <p className="text-lg text-gray-600">Built by developers, for developers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="code" size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Editor</h3>
              <p className="text-gray-600">10 years of frontend development experience, focused on React/TypeScript ecosystem</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="file-text" size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Content Strategist</h3>
              <p className="text-gray-600">Technical writing expert, specializing in simplifying complex concepts into easy-to-understand tutorials</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="cpu" size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">Jarvis - Automated content collection and quality review</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to level up your technical skills?
            </h2>
            <p className="text-indigo-100 text-lg mb-8">
              Join Codcompass for high-quality technical tutorials and expert insights
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-white text-indigo-600 font-medium px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
