import Link from 'next/link';
import Icon from '@/components/ui/Icon';

interface SeriesCardProps {
  series: {
    id: string;
    slug: string;
    title: string;
    titleEn: string;
    description: string | null;
    totalParts: number;
    estimatedTime: number | null;
    articleCount: number;
  };
  locale?: string;
}

export default function SeriesCard({ series, locale = 'en' }: SeriesCardProps) {
  const title = locale === 'zh' && series.title ? series.title : series.titleEn;
  const estimatedTime = series.estimatedTime || Math.max(5, series.totalParts * 10);
  
  return (
    <Link
      href={`/${locale}/kb/series/${series.slug}`}
      className="group block h-full"
    >
      <article className="h-full bg-zinc-900 border border-white/[0.08] rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Icon name="book-marked" size={20} />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {series.articleCount} {locale === 'zh' ? '篇' : 'parts'}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Description */}
        {series.description && (
          <p className="text-sm text-neutral-400 mb-4 line-clamp-2 flex-grow">
            {series.description}
          </p>
        )}
        
        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-4 border-t border-white/[0.06]">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />
            ~{estimatedTime} {locale === 'zh' ? '分钟' : 'min'}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="git-branch" size={12} />
            {locale === 'zh' ? '专题系列' : 'Series'}
          </span>
        </div>
      </article>
    </Link>
  );
}
