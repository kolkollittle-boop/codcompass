import { BackgroundGradient } from '@/components/ui/aceternity/background-gradient';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/icons';

interface TrustBadge {
  icon: IconName;
  title: string;
  description: string;
}

const badges: TrustBadge[] = [
  {
    icon: 'code',
    title: '每周生产级实战',
    description: '聚焦真实落地，而非理论摘要',
  },
  {
    icon: 'download',
    title: 'Production Blueprint',
    description: '下载即用，省去搭环境和调参的时间',
  },
  {
    icon: 'graduation-cap',
    title: '系统化学习路径',
    description: '从 RAG 到多 Agent，结构化进阶',
  },
  {
    icon: 'alert-triangle',
    title: '生产避坑指南',
    description: '来自真实项目的 7 条高频坑点总结',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <BackgroundGradient key={badge.title} containerClassName="w-full h-full">
              <div className="h-full p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-all flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Icon name={badge.icon} size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-white">{badge.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            </BackgroundGradient>
          ))}
        </div>
      </div>
    </section>
  );
}
