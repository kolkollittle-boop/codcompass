import type { Components } from 'react-markdown';
import { isValidElement, type ReactNode } from 'react';
import { slugifyHeading } from '@/lib/slugify-heading';

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return '';
}

/** Per-request unique ids for h2/h3 (pass a fresh `Set` per render). */
export function articleMarkdownComponents(usedIds: Set<string>): Partial<Components> {
  return {
    h2({ children, ...props }) {
      const id = slugifyHeading(extractText(children), usedIds);
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      const id = slugifyHeading(extractText(children), usedIds);
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
  };
}
