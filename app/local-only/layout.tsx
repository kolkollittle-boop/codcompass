import { notFound } from 'next/navigation';
import { isLocalCrawlerUiEnabled } from '@/lib/local-crawler-ui-guard';

export default function LocalOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isLocalCrawlerUiEnabled()) {
    notFound();
  }
  return <>{children}</>;
}
