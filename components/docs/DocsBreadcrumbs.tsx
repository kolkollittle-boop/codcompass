import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

export type DocsCrumb = { label: string; href?: string };

function hrefWithLocale(locale: string, href: string) {
  if (href.startsWith(`/${locale}/`)) return href;
  const path = href.startsWith('/') ? href : `/${href}`;
  return `/${locale}${path}`;
}

export function DocsBreadcrumbs({ locale, items }: { locale: Locale; items: DocsCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const href = item.href ? hrefWithLocale(locale, item.href) : undefined;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
            {href && !isLast ? (
              <Link href={href as never} className="transition-colors hover:text-zinc-300">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-zinc-300' : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
