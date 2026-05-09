import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-neutral-950 to-neutral-900 px-4 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-8xl font-bold text-cyan-400 md:text-9xl">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-200 md:text-3xl">
          Page Not Found
        </h2>
        <p className="text-neutral-400">
          The page you are looking for does not exist or has been moved.
          <br />
          Please check the URL or return to the homepage.
        </p>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            ← Back to Home
          </Link>
          <a
            href="/kb"
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-6 py-3 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
          >
            Browse Knowledge Base
          </a>
        </div>
      </div>
    </div>
  );
}
