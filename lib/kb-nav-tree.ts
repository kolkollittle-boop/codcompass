/**
 * Codcompass Knowledge Base — static navigation tree (recursive sidebar).
 * `href` is app path without locale prefix.
 *
 * Mirrors vault folder layout under `Codcompass_Knowledge_Base/`; leaf nodes open category
 * index pages only—articles list at `/kb`, not nested under topics here.
 *
 * Scope: structured KB content only. Marketing blog (`/blog`) uses separate tables and categories.
 */
export type KbNavNode = {
  label: string;
  href?: `/${string}`;
  children?: KbNavNode[];
  defaultOpen?: boolean;
  isNew?: boolean;
};

function cat(slug: string): `/${string}` {
  return `/kb/categories/${slug}`;
}

export function getKbNavTree(): KbNavNode[] {
  return [
    {
      label: 'AI Engineering',
      defaultOpen: true,
      children: [
        { label: 'AI Agents & Orchestration', href: cat('cc20-1-1-ai-agent-development') },
        { label: 'Enterprise RAG & Knowledge Engines', href: cat('cc20-1-2-enterprise-rag') },
        { label: 'Local LLM Deployment & Optimization', href: cat('cc20-1-3-local-llm') },
        { label: 'AI Productionization & Commercialization', href: cat('cc20-1-4-ai-productization') },
      ],
    },
    {
      label: 'System Evolution',
      children: [
        { label: 'Architecture Modernization & Transformation', href: cat('cc20-2-1-architecture-transformation') },
        { label: 'Scalable Backend Systems', href: cat('cc20-2-scalable-backend-systems') },
        { label: 'DevOps & Infrastructure as Code', href: cat('cc20-2-4-devops-iac') },
      ],
    },
    {
      label: 'Platform & Product Engineering',
      children: [
        { label: 'One-Person Business Operating System', href: cat('cc20-3-3-one-person-os') },
        { label: 'Automated Product Delivery', href: cat('cc20-3-1-digital-asset-matrix') },
        { label: 'Digital Operations Automation', href: cat('cc20-3-2-growth-traffic') },
      ],
    },
    {
      label: 'Developer Mastery',
      children: [
        { label: 'Productivity & Workflow Engineering', href: cat('cc20-4-1-tools-efficiency') },
        { label: 'Systematic Learning & Methodology', href: cat('cc20-4-2-code-quality') },
        { label: 'Cognitive & Architectural Thinking', href: cat('cc20-4-3-reusable-components') },
      ],
    },
    {
      label: 'Cross-Cutting Concerns',
      children: [
        { label: 'Security & Compliance', href: cat('cc20-cross-security-compliance') },
        { label: 'Cost Engineering & Sustainability', href: cat('cc20-cross-cost-sustainability') },
        { label: 'Observability & Intelligent Monitoring', href: cat('cc20-cross-observability') },
      ],
    },
    {
      label: 'Insights & Methodology',
      children: [
        { label: 'Book Reviews', href: cat('cc20-5-2-book-notes') },
        { label: 'Deep Dives', href: cat('cc20-5-deep-dives') },
        { label: 'Research Notes', href: cat('cc20-insights-research-notes') },
      ],
    },
    { label: 'Archive', href: cat('cc20-archive') },
    { label: 'References', href: cat('cc20-references') },
  ];
}

export function collectNavHrefs(nodes: KbNavNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.href) out.push(n.href);
    if (n.children?.length) out.push(...collectNavHrefs(n.children));
  }
  return out;
}

const CATEGORY_HREF_PREFIX = '/kb/categories/';

function categorySlugFromHref(href: string): string {
  if (!href.startsWith(CATEGORY_HREF_PREFIX)) return href;
  return href.slice(CATEGORY_HREF_PREFIX.length);
}

/** Tier-1 browse groups for `/kb/categories` (tier-2 slugs match `Category.slug`). */
export type KbBrowseGroup = {
  id: string;
  label: string;
  defaultOpen?: boolean;
  topics: { label: string; slug: string }[];
};

export function getKbCategoryBrowseGroups(): KbBrowseGroup[] {
  const tree = getKbNavTree();
  return tree.map((node, i) => {
    if (node.children?.length) {
      return {
        id: `browse-${i}-${node.label.replace(/\s+/g, '-').toLowerCase()}`,
        label: node.label,
        defaultOpen: node.defaultOpen,
        topics: node.children.map((c) => ({
          label: c.label,
          slug: categorySlugFromHref(c.href!),
        })),
      };
    }
    return {
      id: `browse-${i}-${node.label.replace(/\s+/g, '-').toLowerCase()}`,
      label: node.label,
      topics: [{ label: node.label, slug: categorySlugFromHref(node.href!) }],
    };
  });
}
