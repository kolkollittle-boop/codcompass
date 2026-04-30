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

        {/* ===== Hero Section ===== */}
        <section className="relative flex flex-col lg:flex-row items-center justify-between py-24 lg:py-32 px-4 max-w-7xl mx-auto">
          {/* 左侧文字 */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-2xl mb-12 lg:mb-0">
            <Spotlight className="-top-40 left-0 md:left-20 md:-top-20" fill="rgba(99, 102, 241, 0.5)" />
            
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
              🚀 Codcompass 2.0 正式上线
            </div>

            {/* 主标题 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 mb-6 leading-tight">
              把知识变成生产力<br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-300">不再只是看文章，而是直接用起来</span>
            </h1>

            {/* 副标题 */}
            <p className="text-base sm:text-lg text-neutral-400 mb-8 leading-relaxed">
              每篇核心文章都配备 <strong className="text-white">Production Blueprint</strong> ——<br />
              可直接部署的代码包 + 真实避坑 Checklist + 架构决策图。<br />
              <strong className="text-indigo-400">新用户首月仅需 9.9 元</strong>，立即开启 AI 工程实战之旅。
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link
                href="/checkout?plan=pro&trial=7d"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
              >
                <Icon name="zap" size={18} />
                首月 9.9 元 · 立即开通 Pro
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all"
              >
                年付仅 99 元 · 每月 8.25 元
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>

            {/* 信任条 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span>30 天无条件退款</span>
              <span>·</span>
              <span>每周 3-5 篇生产实战</span>
              <span>·</span>
              <span>Blueprint 直接可用</span>
            </div>
          </div>

          {/* 右侧 Blueprint 预览 */}
          <div className="relative z-10 w-full lg:w-auto lg:flex-1 lg:max-w-lg">
            <BlueprintPreview />
          </div>
        </section>

        {/* ===== 信任与亮点区 ===== */}
        <TrustBadges />

        {/* ===== 学习路径区 ===== */}
        <LearningPathsSection />

        {/* ===== 标杆内容展示区 ===== */}
        <ShowcaseSection />

        {/* ===== 痛点 vs 解决方案对比区 ===== */}
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

        {/* ===== 底部 CTA 区 ===== */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-30" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              准备好把 AI 知识转化为真实生产力了吗？
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              <strong className="text-white">首月仅 9.9 元</strong>，年付 99 元（每月仅 8.25 元）
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/checkout?plan=pro&trial=7d"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
              >
                立即开通 · 首月 9.9 元
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all"
              >
                浏览定价详情
              </Link>
            </div>
            {/* 信任条 - 淡绿色放大 */}
            <div className="mt-8 text-base text-green-400 font-medium">
              无需信用卡 · 30 天退款保证
            </div>
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
    return null;
  }
  
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Icon name="graduation-cap" size={14} />
            结构化学习
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            结构化学习，不是随机阅读
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            跟随精心策划的学习路径，从基础到生产级实战
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
            浏览全部文章
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// 标杆内容展示区组件
async function ShowcaseSection() {
  return (
    <section className="py-24 px-4 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            第一篇标杆已就绪：RAG 架构进阶
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            这不是普通教程，而是一套完整的生产级解决方案（附完整 Blueprint）
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* 左侧：文章预览 */}
          <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400">L3 Expert</span>
              <span className="text-xs text-zinc-500">15 min read</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">RAG 架构进阶：处理 100GB 级别私有文档</h3>
            <p className="text-sm text-zinc-400 mb-4">
              学习如何设计混合检索架构，解决 Naive RAG 的三大失效模式，实现生产级文档索引与检索降噪。
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['RAG', 'Vector DB', 'Hybrid Search', 'Production'].map(tag => (
                <span key={tag} className="px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-400">{tag}</span>
              ))}
            </div>
            <Link
              href={"/en/kb/series/rag-architecture-advanced" as any}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors text-sm font-medium"
            >
              立即阅读
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          {/* 右侧：Production Bundle 预览 */}
          <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="download" size={16} />
              <span className="text-sm font-medium text-white">Production Blueprint</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Icon name="code" size={16} />
                <div>
                  <div className="text-sm text-white">docker-compose.yml</div>
                  <div className="text-xs text-zinc-500">一键部署配置</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Icon name="check" size={16} />
                <div>
                  <div className="text-sm text-white">避坑 Checklist</div>
                  <div className="text-xs text-zinc-500">7 条高频坑点总结</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Icon name="settings" size={16} />
                <div>
                  <div className="text-sm text-white">config_template.json</div>
                  <div className="text-xs text-zinc-500">配置模板</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <Link
                href={"/en/kb/series/rag-architecture-advanced" as any}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Icon name="download" size={14} />
                下载 Blueprint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
