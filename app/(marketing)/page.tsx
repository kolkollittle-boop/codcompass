import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import SeriesCard from "@/components/SeriesCard";
import DiscordCommunityCard from "@/components/DiscordCommunityCard";
import BrandBanner from "@/components/BrandBanner";
import BlueprintPreview from "@/components/BlueprintPreview";
import TrustBadges from "@/components/TrustBadges";
import ComparisonTable from "@/components/ComparisonTable";
import Icon from "@/components/ui/Icon";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import type { IconName } from "@/components/ui/icons";

// Fetch series data (server component)
async function getPublishedSeries(limit = 6) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/series?limit=${limit}`, {
      next: { revalidate: 300 }, // 5 min cache
      // Avoid SSG hanging when the dev server is not up or the URL is unreachable (Next default prerender ~60s cap).
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.series || [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textSecondary">
      <Header />

      <main className="flex-grow relative overflow-hidden">
        {/* Brand Banner */}
        <BrandBanner variant="topbar" />

        {/* ===== Hero Section ===== */}
        <section className="relative flex flex-col lg:flex-row items-center justify-between py-24 lg:py-32 px-4 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-2xl mb-12 lg:mb-0">
            <Spotlight className="-top-40 left-0 md:left-20 md:-top-20" fill="var(--primary)" />
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary mb-6">
              🚀 Codcompass 2.0 is Live
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-palette-textMuted mb-6 leading-tight">
              Turn Knowledge Into Production<br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-palette-textSecondary">Don't Just Read. Build.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-palette-textMuted mb-8 leading-relaxed">
              Every core article comes with a <strong className="text-white">Production Blueprint</strong> —<br />
              deployable code packages + real-world pitfall checklists + architecture decision diagrams.<br />
              <strong className="text-palette-primary">Start your first month for just $1.49</strong> and dive into AI engineering today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link
                href="/checkout?plan=pro&trial=7d"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-palette-primary text-white font-semibold hover:bg-palette-primary-hover transition-all shadow-lg shadow-cc-theme"
              >
                <Icon name="zap" size={18} />
                Start Pro · $1.49 First Month
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all"
              >
                Annual $14/yr · Just $1.17/mo
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>

            {/* Trust Bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-palette-textMuted">
              <span>30-day money-back guarantee</span>
              <span>·</span>
              <span>3-5 production-ready articles weekly</span>
              <span>·</span>
              <span>Blueprints ready to deploy</span>
            </div>
          </div>

          {/* Right: Blueprint Preview */}
          <div className="relative z-10 w-full lg:w-auto lg:flex-1 lg:max-w-lg">
            <BlueprintPreview />
          </div>
        </section>

        {/* ===== Trust Badges ===== */}
        <TrustBadges />

        {/* ===== Learning Paths ===== */}
        <LearningPathsSection />

        {/* ===== Showcase Section ===== */}
        <ShowcaseSection />

        {/* ===== Comparison Table ===== */}
        <ComparisonTable />

        {/* ===== Newsletter ===== */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <NewsletterSignup />
          </div>
        </section>

        {/* ===== Discord Community ===== */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <DiscordCommunityCard locale="en" />
          </div>
        </section>

        {/* ===== Bottom CTA ===== */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--primary)_22%,transparent)] via-[color-mix(in_srgb,var(--accent)_22%,transparent)] to-[color-mix(in_srgb,var(--primary)_22%,transparent)] blur-3xl opacity-30" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Turn AI Knowledge Into Real Production?
            </h2>
            <p className="text-lg text-palette-textMuted mb-8">
              <strong className="text-white">Just $1.49 for your first month</strong>, or $14/year (only $1.17/mo)
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/checkout?plan=pro&trial=7d"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-palette-primary text-white font-semibold hover:bg-palette-primary-hover transition-all shadow-lg shadow-cc-theme"
              >
                Get Started · $1.49 First Month
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all"
              >
                View Pricing
              </Link>
            </div>
            {/* Trust Bar - Green */}
            <div className="mt-8 text-base text-green-400 font-medium">
              No credit card required · 30-day money-back guarantee
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Learning Paths Section
async function LearningPathsSection() {
  const series = await getPublishedSeries(6);
  
  if (!series || series.length === 0) {
    return null;
  }
  
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary mb-4">
            <Icon name="graduation-cap" size={14} />
            Structured Learning
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-palette-textMuted">
            Structured Learning, Not Random Reading
          </h2>
          <p className="mt-4 text-lg text-palette-textMuted max-w-2xl mx-auto">
            Follow curated learning paths designed to take you from fundamentals to production-ready skills.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s: any) => (
            <BackgroundGradient key={s.id} containerClassName="w-full h-full">
              <SeriesCard series={s} locale="en" />
            </BackgroundGradient>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href={"/kb" as any}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
          >
            Browse All Articles
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Showcase Section
async function ShowcaseSection() {
  return (
    <section className="py-24 px-4 bg-palette-bgTertiary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-palette-textMuted">
            First Showcase Ready: RAG Architecture Advanced
          </h2>
          <p className="mt-4 text-lg text-palette-textMuted max-w-2xl mx-auto">
            This isn't just another tutorial — it's a complete production-ready solution with full Blueprint.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Article Preview */}
          <div className="bg-palette-bgCard border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-palette-bgTertiary text-palette-primary">L3 Expert</span>
              <span className="text-xs text-palette-textMuted">15 min read</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">RAG Architecture Advanced: Handling 100GB Private Documents</h3>
            <p className="text-sm text-palette-textMuted mb-4">
              Learn how to design hybrid search architectures, solve the three failure modes of Naive RAG, and achieve production-grade document indexing with noise reduction.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['RAG', 'Vector DB', 'Hybrid Search', 'Production'].map(tag => (
                <span key={tag} className="px-2 py-1 rounded-full text-xs bg-palette-bgSecondary text-palette-textMuted">{tag}</span>
              ))}
            </div>
            <Link
              href={"/en/kb/series/rag-architecture-advanced" as any}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-palette-primary/20 text-palette-primary hover:bg-palette-primary/30 transition-colors text-sm font-medium"
            >
              Read Now
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          {/* Right: Production Bundle Preview */}
          <div className="bg-palette-bgCard border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="download" size={16} />
              <span className="text-sm font-medium text-white">Production Blueprint</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-palette-bgSecondary rounded-lg">
                <Icon name="code" size={16} />
                <div>
                  <div className="text-sm text-white">docker-compose.yml</div>
                  <div className="text-xs text-palette-textMuted">One-click deployment config</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-palette-bgSecondary rounded-lg">
                <Icon name="check" size={16} />
                <div>
                  <div className="text-sm text-white">Pitfall Checklist</div>
                  <div className="text-xs text-palette-textMuted">7 high-frequency pitfalls summarized</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-palette-bgSecondary rounded-lg">
                <Icon name="settings" size={16} />
                <div>
                  <div className="text-sm text-white">config_template.json</div>
                  <div className="text-xs text-palette-textMuted">Configuration template</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <Link
                href={"/en/kb/series/rag-architecture-advanced" as any}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-palette-primary text-white hover:bg-palette-primary-hover transition-colors text-sm font-medium"
              >
                <Icon name="download" size={14} />
                Download Blueprint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
