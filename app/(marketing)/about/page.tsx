import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col text-palette-textPrimary">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative overflow-hidden px-4 py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(23,178,100,0.14),transparent)]" />
          <div className="relative mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-docs-heading sm:text-5xl">
              About <span className="text-docs-accent">Codcompass</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-docs-body sm:text-xl">
              High-quality technical tutorials and a knowledge base for developers—focused on production-ready practice and Blueprints.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-docs-heading">Our mission</h2>
              <p className="mb-4 text-lg text-docs-body">
                In a sea of noise, developers need trusted curation and content that ships. Codcompass is committed to:
              </p>
              <ul className="space-y-3 text-docs-body">
                <li className="flex items-start">
                  <svg className="mr-3 mt-0.5 h-6 w-6 shrink-0 text-docs-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <Icon name="book-marked" size={16} className="mr-1 inline text-docs-accent" /> Curated, high-signal technical content
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="mr-3 mt-0.5 h-6 w-6 shrink-0 text-docs-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <Icon name="code" size={16} className="mr-1 inline text-docs-accent" /> Production-ready examples from real projects
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="mr-3 mt-0.5 h-6 w-6 shrink-0 text-docs-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <Icon name="refresh" size={16} className="mr-1 inline text-docs-accent" /> Ongoing coverage of frameworks, tools, and best practices
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="mr-3 mt-0.5 h-6 w-6 shrink-0 text-docs-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <Icon name="target" size={16} className="mr-1 inline text-docs-accent" /> Deep focus on React, TypeScript, Next.js, and the modern stack
                  </span>
                </li>
              </ul>
            </div>
            <div className="docs-card rounded-2xl border border-docs-border bg-docs-surface p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-docs-border">
                  <Icon name="compass" size={32} className="text-docs-accent" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-docs-heading">Codcompass</h3>
                <p className="text-docs-body">Code + Compass = a navigator for builders</p>
                <p className="mt-2 text-docs-muted">Alongside your technical growth path</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-y border-docs-border bg-docs-surface/50 py-16">
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="mb-2 text-4xl font-bold text-docs-accent">50+</div>
                <div className="text-docs-muted">Technical articles</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-docs-accent">12</div>
                <div className="text-docs-muted">Topic series</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-docs-accent">4.8</div>
                <div className="text-docs-muted">Average rating</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-docs-accent">Weekly</div>
                <div className="text-docs-muted">Fresh updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-docs-heading">Core team</h2>
            <p className="text-lg text-docs-body">Built by developers, for developers</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-docs-border">
                <Icon name="code" size={32} className="text-docs-accent" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-docs-heading">Technical editor</h3>
              <p className="text-docs-body">Ten years in frontend, deep in the React / TypeScript ecosystem</p>
            </div>
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 ring-1 ring-teal-500/20">
                <Icon name="file-text" size={32} className="text-teal-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-docs-heading">Content strategy</h3>
              <p className="text-docs-body">Technical writing and structured explanations that make hard topics clear</p>
            </div>
            <div className="docs-card rounded-xl border border-docs-border bg-docs-surface p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-docs-green-subtle ring-1 ring-docs-accent/25">
                <Icon name="cpu" size={32} className="text-docs-accent" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-docs-heading">AI assistant</h3>
              <p className="text-docs-body">Jarvis — assists with ingestion and first-pass quality checks</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-docs-border bg-docs-accent py-16">
          <div className="mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to grow your skills?</h2>
            <p className="mb-8 text-lg text-white/90">Join Codcompass for high-quality tutorials and expert perspective</p>
            <Link
              href="/pricing"
              className="inline-block rounded-md border border-white/20 bg-docs-bg px-8 py-3 font-medium text-docs-heading transition-colors hover:bg-docs-surface"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
