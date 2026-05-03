/**
 * Static KB navigation tree (infinite depth supported by recursive renderer).
 * `href` is app path without locale prefix (middleware / Link resolve locale).
 */
export type KbNavNode = {
  label: string;
  href?: `/${string}`;
  children?: KbNavNode[];
  defaultOpen?: boolean;
  isNew?: boolean;
};

export function getKbNavTree(): KbNavNode[] {
  return [
    {
      label: 'RAG Production',
      defaultOpen: true,
      children: [
        {
          label: 'Fundamentals',
          children: [
            { label: 'RAG Basics', href: '/kb/rag-intro' },
            { label: 'RAG Architecture', href: '/kb/rag-architecture' },
          ],
        },
        {
          label: 'Pipeline',
          children: [
            { label: 'Indexing Strategy', href: '/kb/rag-indexing' },
            { label: 'Retrieval Optimization', href: '/kb/rag-retrieval' },
            { label: 'Evaluation & Monitoring', href: '/kb/rag-evaluation' },
            { label: 'Production Deployment', href: '/kb/rag-production', isNew: true },
            { label: '7 Common Pitfalls', href: '/kb/rag-pitfalls' },
          ],
        },
      ],
    },
    {
      label: 'AI Agent Dev',
      children: [
        { label: 'Agent Basics', href: '/kb/agent-basics' },
        { label: 'Tool Calling', href: '/kb/agent-tools' },
        { label: 'Planning & Execution', href: '/kb/agent-planning' },
      ],
    },
    {
      label: 'Database & Vectors',
      children: [
        { label: 'Vector Databases', href: '/kb/vector-db' },
        { label: 'Embedding Models', href: '/kb/embeddings' },
        { label: 'Hybrid Search', href: '/kb/hybrid-search' },
      ],
    },
    {
      label: 'System Architecture',
      children: [
        { label: 'Microservices Design', href: '/kb/microservices' },
        { label: 'API Design', href: '/kb/api-design' },
        { label: 'Caching Strategy', href: '/kb/caching' },
      ],
    },
    {
      label: 'Security & Compliance',
      children: [
        { label: 'Auth & Authorization', href: '/kb/auth' },
        { label: 'Data Privacy', href: '/kb/data-privacy' },
        { label: 'Rate Limiting', href: '/kb/rate-limiting' },
      ],
    },
    {
      label: 'Ops & Config',
      children: [
        { label: 'Monitoring & Alerts', href: '/kb/monitoring' },
        { label: 'CI/CD Pipeline', href: '/kb/ci-cd' },
        { label: 'Config Management', href: '/kb/config-mgmt' },
      ],
    },
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
