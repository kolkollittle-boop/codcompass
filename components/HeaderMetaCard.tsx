'use client';

import { Star, Clock, Target, Tag } from 'lucide-react';

interface HeaderMetaCardProps {
  difficultyLevel?: string | null;
  readingTime?: number | null;
  expectedOutcome?: string | null;
  tags?: string[];
  seriesTitle?: string | null;
  seriesOrder?: number | null;
  seriesTotal?: number | null;
  seriesEstimatedTime?: number | null;
}

const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  L1: { label: 'Beginner', color: 'text-zinc-300', stars: 1 },
  L2: { label: 'Intermediate', color: 'text-zinc-400', stars: 2 },
  L3: { label: 'Advanced', color: 'text-zinc-400', stars: 3 },
  L4: { label: 'Expert', color: 'text-zinc-300', stars: 4 },
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
    <div className="docs-card mb-8 rounded-xl bg-docs-surface p-6">
      {expectedOutcome && (
        <div className="mb-5 border-b border-docs-border pb-5">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-500" />
            <p className="font-medium leading-relaxed text-zinc-300">{expectedOutcome}</p>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Difficulty</span>
          <div className="flex items-center gap-2">
            {difficulty && (
              <>
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= difficulty.stars ? `${difficulty.color} fill-current` : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${difficulty.color}`}>{difficulty.label}</span>
              </>
            )}
          </div>
        </div>

        {readingTime && (
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-xs uppercase tracking-wider text-zinc-500">Read Time</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">{readingTime} min</span>
            </div>
          </div>
        )}

        {seriesTitle && seriesOrder && seriesTotal && (
          <div className="col-span-2 flex flex-col items-center gap-1 sm:col-span-1 sm:items-start">
            <span className="text-xs uppercase tracking-wider text-zinc-500">Series</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-zinc-400">
                {seriesOrder}/{seriesTotal}
              </span>
              {seriesEstimatedTime && (
                <span className="text-xs text-zinc-500">(~{seriesEstimatedTime}min total)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-docs-border bg-docs-bg px-2.5 py-1 text-xs text-zinc-500"
            >
              <Tag className="h-3 w-3" />#{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
