'use client';

import Link from 'next/link';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

interface PathNavigatorProps {
  seriesTitle: string;
  seriesSlug: string;
  currentOrder: number;
  totalParts: number;
  estimatedTime?: number | null;
  parts: Array<{
    order: number;
    title: string;
    slug: string;
    isPublished: boolean;
    isCompleted?: boolean;
  }>;
  locale?: string;
}

export default function PathNavigator({
  seriesTitle,
  seriesSlug,
  currentOrder,
  totalParts,
  estimatedTime,
  parts,
  locale = 'en',
}: PathNavigatorProps) {
  const progress = Math.round((currentOrder / totalParts) * 100);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sticky top-20">
      {/* 专题标题 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          Learning Path
        </h3>
        <Link
          href={`/${locale}/kb/series/${seriesSlug}`}
          className="text-lg font-bold text-zinc-100 hover:text-cyan-400 transition-colors"
        >
          {seriesTitle}
        </Link>
        {estimatedTime && (
          <p className="text-xs text-zinc-500 mt-1">
            ~{estimatedTime} min total · {totalParts} parts
          </p>
        )}
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 章节列表 */}
      <div className="space-y-2">
        {parts.map((part) => {
          const isCurrent = part.order === currentOrder;
          const isCompleted = part.isCompleted;
          const isLocked = !part.isPublished;

          return (
            <div
              key={part.order}
              className={`
                flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors
                ${isCurrent ? 'bg-cyan-500/10 border border-cyan-500/30' : ''}
                ${isLocked ? 'opacity-50' : ''}
              `}
            >
              {/* 状态图标 */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-zinc-600" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                )}
              </div>

              {/* 章节信息 */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-zinc-500 mr-1">#{part.order}</span>
                {isLocked ? (
                  <span className="text-zinc-500 truncate">{part.title}</span>
                ) : isCurrent ? (
                  <span className="text-cyan-400 font-medium truncate">{part.title}</span>
                ) : (
                  <Link
                    href={`/${locale}/kb/${part.slug}`}
                    className="text-zinc-300 hover:text-zinc-100 truncate block"
                  >
                    {part.title}
                  </Link>
                )}
              </div>

              {/* 箭头 */}
              {!isCurrent && !isLocked && (
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* 解锁提示 */}
      {parts.some(p => !p.isPublished) && (
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Upgrade to <span className="text-cyan-400">Pro</span> to unlock all parts
          </p>
        </div>
      )}
    </div>
  );
}
