'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { slugifyHeading } from '@/lib/slugify-heading';

export type TocItem = { id: string; text: string; level: number };

export function DocsToc() {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const root = document.getElementById('docs-content');
    if (!root) {
      setItems([]);
      return;
    }
    const used = new Set<string>();
    const heads = [...root.querySelectorAll('h2,h3')] as HTMLElement[];
    const next: TocItem[] = [];
    for (const el of heads) {
      const text = el.textContent?.trim() ?? '';
      if (!text) continue;
      let id = el.id;
      if (!id) {
        id = slugifyHeading(text, used);
        el.id = id;
      } else {
        used.add(id);
      }
      next.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 });
    }
    setItems(next);
  }, [pathname]);

  const updateActive = useCallback(() => {
    const root = document.getElementById('docs-content');
    if (!root) return;
    const heads = [...root.querySelectorAll('h2,h3')] as HTMLElement[];
    if (!heads.length) return;
    const offset = 96;
    const y = window.scrollY + offset;
    let current = heads[0].id;
    for (const h of heads) {
      const top = h.getBoundingClientRect().top + window.scrollY;
      if (top <= y) current = h.id;
      else break;
    }
    setActiveId(current);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => window.removeEventListener('scroll', updateActive);
  }, [items, updateActive]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-xs">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-docs-muted">On this page</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: (item.level - 2) * 10 }}>
            <a
              href={`#${item.id}`}
              className={cn(
                'docs-toc-link block border-l-2 py-0.5 pl-2.5 transition-colors',
                activeId === item.id
                  ? 'border-docs-accent text-docs-accent'
                  : 'border-transparent text-docs-muted hover:text-docs-secondary',
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(item.id);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
