import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import SeriesCard from "@/components/SeriesCard";
import DiscordCommunityCard from "@/components/DiscordCommunityCard";
import BrandBanner from "@/components/BrandBanner";
import Icon from "@/components/ui/Icon";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { BackgroundGradient } from "@/components/ui/aceternity/background-gradient";
import type { IconName } from "@/components/ui/icons";

const features: { icon: IconName; title: string; desc: string }[] = [
  { icon: "zap", title: "Stay Ahead", desc: "Get curated insights from the top 1% of developer content." },
  { icon: "bookmark", title: "Learn Deeply", desc: "In-depth technical articles, not just summaries or clickbait." },
  { icon: "clock", title: "Save Time", desc: "No more doom-scrolling. We filter the noise for you." },
];

const stats = [
  { value: '10K+', label: 'Articles Curated' },
  { value: '500+', label: 'Expert Authors' },
  { value: '25K+', label: 'Monthly Readers' },
  { value: 'Weekly', label: 'Updates' },
];

// 获取专题数据（服务端组件直接调用）
async function getPublishedSeries(limit = 6) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/series?limit=${limit}`, {
      next: { revalidate: 300 } // 5 分钟缓存
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
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-neutral-200">
      <Header />

      <main className="flex-grow relative overflow-hidden">
        {/* Brand Banner */}
        <BrandBanner variant="topbar" />

        {/* Hero Section with Spotlight */}
        <section className="relative flex flex-col items-center justify-center py-32 px-4 text-center">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(99, 102, 241, 0.5)" />
          <h1 className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 mb-8">
            Level Up Your<br />Development Skills
          </h1>
          <p className="relative z-10 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Premium tutorials and expert insights for developers who want to build better software. No fluff, just practical knowledge.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={"/kb" as any}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all"
            >
              <Icon name="book" size={20} />
              Browse Articles
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all"
            >
              View Pricing
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative px-4 max-w-6xl mx-auto w-full py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <BackgroundGradient key={stat.label} containerClassName="w-full h-full">
                <div className="h-full p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{stat.value}</div>
                  <div className="text-sm text-neutral-400 font-medium">{stat.label}</div>
                </div>
              </BackgroundGradient>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">Why Developers Choose Codcompass</h2>
              <p className="mt-4 text-lg text-neutral-400">Quality content that actually helps you build better software.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <BackgroundGradient key={f.title} containerClassName="w-full h-full">
                  <div className="h-full p-8 bg-zinc-900 border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-all flex flex-col gap-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <Icon name={f.icon} size={24} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                      <p className="text-neutral-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Paths - 专题路径展示区 */}
        <LearningPathsSection />

        {/* Newsletter */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <NewsletterSignup />
          </div>
        </section>

        {/* Discord Community */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <DiscordCommunityCard locale="en" />
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-30" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Start Learning Today</h2>
            <p className="mt-4 text-lg text-neutral-400 max-w-xl mx-auto">
              Get unlimited access to all tutorials, code examples, and expert insights for just $9.99/month.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all"
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

// 专题路径展示区组件
async function LearningPathsSection() {
  const series = await getPublishedSeries(6);
  
  if (!series || series.length === 0) {
    return null; // 没有专题时不显示
  }
  
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Icon name="graduation-cap" size={14} />
            Learning Paths
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            Structured Learning, Not Random Reading
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
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
