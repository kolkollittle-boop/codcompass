interface ComparisonItem {
  pain: string;
  solution: string;
}

const comparisons: ComparisonItem[] = [
  {
    pain: '看完文章还要自己从零搭环境、反复踩坑',
    solution: '直接下载 Blueprint，一键部署到生产',
  },
  {
    pain: '碎片化阅读，学完就忘',
    solution: '系统化学习路径 + 进度追踪',
  },
  {
    pain: '自己踩坑，浪费几天',
    solution: '7 条避坑指南，提前绕过陷阱',
  },
  {
    pain: '到处找资料，效率低',
    solution: '一站式平台，每周 3-5 篇更新',
  },
  {
    pain: '付费后觉得不值',
    solution: '30 天无条件退款保证',
  },
];

export default function ComparisonTable() {
  return (
    <section className="py-24 px-4 bg-zinc-900/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            为什么开发者选择 Codcompass 2.0
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            我们不只是提供内容，而是交付生产力
          </p>
        </div>

        {/* 对比表格 */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-zinc-900">
          {/* 表头 */}
          <div className="grid grid-cols-2 border-b border-white/[0.08]">
            <div className="p-4 sm:p-6 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <span className="text-xl">😰</span>
                <span>传统学习方式</span>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-green-500/5 border-l border-white/[0.08]">
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <span className="text-xl">✅</span>
                <span>Codcompass 2.0</span>
              </div>
            </div>
          </div>

          {/* 表格内容 */}
          <div className="divide-y divide-white/[0.08]">
            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-2">
                <div className="p-4 sm:p-5 text-sm sm:text-base text-zinc-400">
                  {item.pain}
                </div>
                <div className="p-4 sm:p-5 text-sm sm:text-base text-zinc-200 border-l border-white/[0.08] font-medium">
                  {item.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
