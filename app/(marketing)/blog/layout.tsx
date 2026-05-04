import { connection } from 'next/server';

/**
 * Force dynamic rendering for all `/blog/*` routes so `next build` does not prerender
 * against a database that may not have `BlogPost` / `BlogCategory` yet.
 */
export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return <>{children}</>;
}
