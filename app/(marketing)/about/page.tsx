import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_22%,transparent)] via-palette-bgPrimary to-[color-mix(in_srgb,var(--accent)_22%,transparent)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                About Codcompass
              </h1>
              <p className="text-xl text-palette-textMuted max-w-2xl mx-auto">
                A knowledge base platform providing high-quality technical tutorials and expert insights for developers
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-palette-textMuted mb-4">
                In an era of information overload, developers face a flood of content but varying quality. Codcompass is dedicated to:
              </p>
              <ul className="space-y-3 text-palette-textMuted">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-palette-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="book-marked" size={16} className="inline text-palette-primary mr-1" /> Curating high-quality technical content, rejecting information noise</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-palette-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="code" size={16} className="inline text-palette-primary mr-1" /> Providing production-ready code examples from real projects</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-palette-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="refresh" size={16} className="inline text-palette-primary mr-1" /> Weekly updates on the latest frameworks, tools, and best practices</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-palette-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><Icon name="target" size={16} className="inline text-palette-primary mr-1" /> Focusing on modern tech stacks like React, TypeScript, Next.js</span>
                </li>
              </ul>
            </div>
            <div className="bg-palette-bgCard rounded-2xl shadow-lg p-8 border border-palette-border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palette-bgTertiary flex items-center justify-center">
                  <Icon name="compass" size={32} className="text-palette-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Codcompass</h3>
                <p className="text-palette-textMuted">Code + Compass = Developer's Compass</p>
                <p className="text-palette-textMuted mt-2">Navigating your technical growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-palette-bgSecondary py-16 border-y border-palette-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-palette-primary mb-2">50+</div>
                <div className="text-palette-textMuted">Technical Articles</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-palette-primary mb-2">12</div>
                <div className="text-palette-textMuted">Tech Topics</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-palette-primary mb-2">4.8</div>
                <div className="text-palette-textMuted">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-palette-primary mb-2">Weekly</div>
                <div className="text-palette-textMuted">Continuous Updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Core Team</h2>
            <p className="text-lg text-palette-textMuted">Built by developers, for developers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-palette-bgCard rounded-xl shadow-md p-6 text-center border border-palette-border">
              <div className="w-20 h-20 bg-palette-bgTertiary rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="code" size={32} className="text-palette-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Technical Editor</h3>
              <p className="text-palette-textMuted">10 years of frontend development experience, focused on React/TypeScript ecosystem</p>
            </div>
            <div className="bg-palette-bgCard rounded-xl shadow-md p-6 text-center border border-palette-border">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="file-text" size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Content Strategist</h3>
              <p className="text-palette-textMuted">Technical writing expert, specializing in simplifying complex concepts into easy-to-understand tutorials</p>
            </div>
            <div className="bg-palette-bgCard rounded-xl shadow-md p-6 text-center border border-palette-border">
              <div className="w-20 h-20 bg-green-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="cpu" size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Assistant</h3>
              <p className="text-palette-textMuted">Jarvis - Automated content collection and quality review</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-palette-primary py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to level up your technical skills?
            </h2>
            <p className="text-palette-textSecondary text-lg mb-8">
              Join Codcompass for high-quality technical tutorials and expert insights
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-white text-palette-primary font-medium px-8 py-3 rounded-lg hover:bg-palette-bgTertiary transition-colors"
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
