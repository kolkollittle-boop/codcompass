'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getKbNavTree, type KbNavNode } from '@/lib/kb-nav-tree';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui';

function NavBranch({
  nodes,
  pathname,
  locale,
  depth,
  onNavigate,
}: {
  nodes: KbNavNode[];
  pathname: string | null;
  locale: string;
  depth: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className={cn(depth === 0 ? 'space-y-0.5' : 'mt-1 space-y-0.5 border-l border-docs-border/80 pl-2.5')}>
      {nodes.map((node, i) => {
        const key = `${depth}-${i}-${node.label}`;
        if (node.children?.length) {
          return (
            <li key={key}>
              <details className="group" open={node.defaultOpen}>
                <summary
                  className={cn(
                    'docs-nav-item cursor-pointer list-none rounded-md px-2 py-1.5 text-sm text-docs-secondary marker:hidden [&::-webkit-details-marker]:hidden',
                    'hover:text-docs-heading',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{node.label}</span>
                    {node.isNew ? (
                      <span className="rounded bg-docs-green-subtle px-1.5 py-0.5 text-[10px] font-medium text-docs-accent">
                        New
                      </span>
                    ) : null}
                  </span>
                </summary>
                <NavBranch
                  nodes={node.children}
                  pathname={pathname}
                  locale={locale}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              </details>
            </li>
          );
        }

        if (!node.href) {
          return (
            <li key={key} className="px-2 py-1 text-sm text-docs-muted">
              {node.label}
            </li>
          );
        }

        const fullHref = `/${locale}${node.href}`;
        const active = pathname === fullHref || pathname?.startsWith(`${fullHref}/`);

        return (
          <li key={key}>
            <Link
              href={fullHref as never}
              data-active={active ? 'true' : 'false'}
              onClick={onNavigate}
              className={cn(
                'docs-nav-item block rounded-md px-2 py-1.5 text-sm text-docs-body',
                active && 'text-docs-accent',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{node.label}</span>
                {node.isNew ? (
                  <span className="rounded bg-docs-green-subtle px-1.5 py-0.5 text-[10px] font-medium text-docs-accent">
                    New
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const tree = getKbNavTree();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const closeNav = () => setSidebarOpen(false);

  return (
    <div className="docs-shell docs-scroll flex min-h-0 flex-1 flex-col">
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-14 z-[1040] bg-black/50 backdrop-blur-[1px] lg:hidden"
          aria-hidden
          onClick={closeNav}
        />
      )}
      <div className="mx-auto flex w-full max-w-site min-h-0 flex-1 gap-6 px-4 py-4 sm:px-6 lg:gap-8 lg:px-8 lg:py-6">
        <aside
          className={cn(
            'docs-scroll fixed left-0 top-14 z-[1050] h-[calc(100dvh-3.5rem)] w-docs-sidebar shrink-0 overflow-y-auto border-r border-docs-border bg-docs-bg transition-transform duration-300 ease-out',
            'max-lg:-translate-x-full',
            sidebarOpen && 'max-lg:translate-x-0',
            'lg:sticky lg:top-16 lg:z-0 lg:block lg:h-auto lg:max-h-[calc(100dvh-4.5rem)] lg:translate-x-0 lg:border-r-0 lg:bg-transparent',
          )}
          aria-label="Documentation"
        >
          <div className="flex items-center justify-between border-b border-docs-border px-3 py-2 lg:hidden">
            <span className="text-sm font-semibold text-docs-heading">Topics</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md text-docs-muted hover:bg-white/10 hover:text-docs-heading"
              aria-label="Close sidebar"
              onClick={closeNav}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
          <div className="p-3 lg:p-0">
            <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-docs-muted lg:block">
              Knowledge Base
            </p>
            <NavBranch nodes={tree} pathname={pathname} locale={locale} depth={0} onNavigate={closeNav} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:pl-0">
          <button
            type="button"
            className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-docs-border bg-docs-surface px-3 py-2 text-sm font-medium text-docs-heading transition-colors hover:border-docs-border-hover hover:bg-white/5 lg:hidden"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" size={18} />
            Browse topics
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
