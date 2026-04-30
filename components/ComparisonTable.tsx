interface ComparisonItem {
  pain: string;
  solution: string;
}

const comparisons: ComparisonItem[] = [
  {
    pain: 'Build from scratch after reading, waste time on pitfalls',
    solution: 'Download Blueprint, deploy to production instantly',
  },
  {
    pain: 'Fragmented reading, forget after learning',
    solution: 'Systematic learning paths + progress tracking',
  },
  {
    pain: 'Waste days on pitfalls',
    solution: '7 pitfall guides, avoid traps in advance',
  },
  {
    pain: 'Search everywhere for materials, low efficiency',
    solution: 'One-stop platform, 3-5 weekly updates',
  },
  {
    pain: 'Feel it\'s not worth it after paying',
    solution: '30-day unconditional money-back guarantee',
  },
];

export default function ComparisonTable() {
  return (
    <section className="py-24 px-4 bg-zinc-900/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            Why Developers Choose Codcompass 2.0
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            We don't just deliver content, we deliver productivity
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-zinc-900">
          {/* Table Header */}
          <div className="grid grid-cols-2 border-b border-white/[0.08]">
            <div className="p-4 sm:p-6 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <span className="text-xl">😰</span>
                <span>Traditional Learning</span>
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
