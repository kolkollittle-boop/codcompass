'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { getKbNavTree, type KbNavNode } from '@/lib/kb-nav-tree';
import { cn } from '@/lib/utils';

function NavBranch({
  nodes,
  pathname,
  locale,
  depth,
}: {
  nodes: KbNavNode[];
  pathname: string | null;
  locale: string;
  depth: number;
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
                <NavBranch nodes={node.children} pathname={pathname} locale={locale} depth={depth + 1} />
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

  return (
    <div className="docs-shell docs-scroll flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-site min-h-0 flex-1 gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className="docs-scroll sticky top-16 hidden max-h-[calc(100dvh-4.5rem)] w-docs-sidebar shrink-0 overflow-y-auto lg:block"
          aria-label="Documentation"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-docs-muted">Knowledge Base</p>
          <NavBranch nodes={tree} pathname={pathname} locale={locale} depth={0} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
