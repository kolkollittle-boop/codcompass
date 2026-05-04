'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KbNavNode } from '@/lib/kb-nav-tree';

function pathMatches(pathname: string | null, href: string, locale: string): boolean {
  if (!pathname) return false;
  const localized = `/${locale}${href}`;
  return pathname === localized || pathname.endsWith(href);
}

function subtreeHasActive(node: KbNavNode, pathname: string | null, locale: string): boolean {
  if (node.href && pathMatches(pathname, node.href, locale)) return true;
  if (!node.children) return false;
  return node.children.some((c) => subtreeHasActive(c, pathname, locale));
}

function NavLeaf({
  href,
  label,
  locale,
  isNew,
}: {
  href: string;
  label: string;
  locale: string;
  isNew?: boolean;
}) {
  const pathname = usePathname();
  const active = pathMatches(pathname, href, locale);
  const to = `/${locale}${href}`;

  return (
    <Link
      href={to as any}
      data-active={active ? 'true' : undefined}
      className={cn(
        'docs-nav-item group flex items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-xs',
        !active && 'text-docs-muted',
      )}
    >
      <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-70" aria-hidden />
      <span className="min-w-0 flex-1 truncate leading-snug">{label}</span>
      {isNew ? <Sparkles className="h-3 w-3 shrink-0 text-amber-400/90" aria-label="New" /> : null}
    </Link>
  );
}

function NavBranch({ node, locale }: { node: KbNavNode; locale: string }) {
  const pathname = usePathname();
  const hasChildren = Boolean(node.children?.length);
  const activeChild = hasChildren ? subtreeHasActive(node, pathname, locale) : false;
  const selfActive = node.href ? pathMatches(pathname, node.href, locale) : false;
  const [open, setOpen] = useState(Boolean(node.defaultOpen || activeChild || selfActive));

  useEffect(() => {
    if (activeChild || selfActive) setOpen(true);
  }, [activeChild, selfActive]);

  if (!hasChildren && node.href) {
    return <NavLeaf href={node.href} label={node.label} locale={locale} isNew={node.isNew} />;
  }

  if (hasChildren) {
    return (
      <div className="mb-0.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'docs-nav-item flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs border border-transparent',
            activeChild ? 'text-docs-heading' : 'text-docs-muted hover:text-docs-secondary',
          )}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
          )}
          <span className="min-w-0 flex-1 truncate font-medium">{node.label}</span>
        </button>
        {open ? (
          <div className="mt-0.5 space-y-0.5 border-l border-docs-border/80 pl-2 ml-2">
            {node.children!.map((child, i) => (
              <NavBranch key={`${node.label}-${i}`} node={child} locale={locale} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}

export function DocsSidebarNav({
  tree,
  locale,
  footer,
}: {
  tree: KbNavNode[];
  locale: string;
  footer?: ReactNode;
}) {
  const keyed = useMemo(
    () => tree.map((n, i) => <NavBranch key={i} node={n} locale={locale} />),
    [tree, locale],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="docs-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 pt-2">{keyed}</nav>
      {footer ? <div className="shrink-0 border-t border-docs-border px-3 py-3">{footer}</div> : null}
    </div>
  );
}
