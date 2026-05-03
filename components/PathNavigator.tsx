'use client';

import Link from 'next/link';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="docs-card sticky top-24 rounded-xl bg-docs-surface p-5">
      <div className="mb-4">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">Learning Path</h3>
        <Link
          href={`/${locale}/kb/series/${seriesSlug}`}
          className="text-lg font-bold text-white transition-colors hover:text-zinc-200"
        >
          {seriesTitle}
        </Link>
        {estimatedTime && (
          <p className="mt-1 text-xs text-zinc-500">
            ~{estimatedTime} min total · {totalParts} parts
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-docs-bg">
          <div
            className="h-full rounded-full bg-zinc-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {parts.map((part) => {
          const isCurrent = part.order === currentOrder;
          const isCompleted = part.isCompleted;
          const isLocked = !part.isPublished;

          return (
            <div
              key={part.order}
              className={cn(
                'flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors',
                isCurrent && 'border border-docs-border bg-white/[0.06]',
                isLocked ? 'opacity-50' : '',
              )}
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-zinc-400" />
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-zinc-500" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="mr-1 text-xs text-zinc-500">#{part.order}</span>
                {isLocked ? (
                  <span className="truncate text-zinc-500">{part.title}</span>
                ) : isCurrent ? (
                  <span className="truncate font-medium text-white">{part.title}</span>
                ) : (
                  <Link
                    href={`/${locale}/kb/${part.slug}`}
                    className="block truncate text-zinc-400 transition-colors hover:text-white"
                  >
                    {part.title}
                  </Link>
                )}
              </div>

              {!isCurrent && !isLocked && (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-600" />
              )}
            </div>
          );
        })}
      </div>

      {parts.some((p) => !p.isPublished) && (
        <div className="mt-4 border-t border-docs-border pt-4 text-center">
          <p className="text-xs text-zinc-500">
            Upgrade to <span className="font-medium text-zinc-300">Pro</span> to unlock all parts
          </p>
        </div>
      )}
    </div>
  );
}
