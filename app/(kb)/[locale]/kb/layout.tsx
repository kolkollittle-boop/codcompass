import { DocsLayout } from '@/components/docs/DocsLayout';

/** KB docs: three columns + left tree (CloudQuery docs — fig. 4). */
export default function KbDocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
