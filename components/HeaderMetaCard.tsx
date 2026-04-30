'use client';

import { Star, Clock, Target, Tag } from 'lucide-react';

interface HeaderMetaCardProps {
  difficultyLevel?: string | null;    // L1, L2, L3, L4
  readingTime?: number | null;        // 预计阅读时间（分钟）
  expectedOutcome?: string | null;    // 预期收益短句
  tags?: string[];                    // 标签列表
  seriesTitle?: string | null;        // 专题名称
  seriesOrder?: number | null;        // 专题中的顺序
  seriesTotal?: number | null;        // 专题总篇数
  seriesEstimatedTime?: number | null; // 专题总预计学习时间
}

// 难度等级配置
const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  L1: { label: 'Beginner', color: 'text-emerald-400', stars: 1 },
  L2: { label: 'Intermediate', color: 'text-yellow-400', stars: 2 },
  L3: { label: 'Advanced', color: 'text-orange-400', stars: 3 },
  L4: { label: 'Expert', color: 'text-red-400', stars: 4 },
};

export default function HeaderMetaCard({
  difficultyLevel,
  readingTime,
  expectedOutcome,
  tags = [],
  seriesTitle,
  seriesOrder,
  seriesTotal,
  seriesEstimatedTime,
}: HeaderMetaCardProps) {
  const difficulty = difficultyLevel ? difficultyConfig[difficultyLevel] || difficultyConfig.L2 : null;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mb-8">
      {/* 预期收益 - 扎心短句 */}
      {expectedOutcome && (
        <div className="mb-5 pb-5 border-b border-zinc-800">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-zinc-200 font-medium leading-relaxed">
              {expectedOutcome}
            </p>
          </div>
        </div>
      )}

      {/* 元数据网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {/* 难度等级 */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Difficulty</span>
          <div className="flex items-center gap-2">
            {difficulty && (
              <>
                <div className="flex">
                  {[1, 2, 3, 4].map(i => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= difficulty.stars
                          ? `${difficulty.color} fill-current`
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${difficulty.color}`}>
                  {difficulty.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 阅读时间 */}
        {readingTime && (
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Read Time</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-300">{readingTime} min</span>
            </div>
          </div>
        )}

        {/* 专题进度 */}
        {seriesTitle && seriesOrder && seriesTotal && (
          <div className="flex flex-col items-center sm:items-start gap-1 col-span-2 sm:col-span-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Series</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-zinc-300">
                {seriesOrder}/{seriesTotal}
              </span>
              {seriesEstimatedTime && (
                <span className="text-xs text-zinc-500">
                  (~{seriesEstimatedTime}min total)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 标签 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md border border-zinc-700/50"
            >
              <Tag className="w-3 h-3" />
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
