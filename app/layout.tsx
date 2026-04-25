import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: {
    default: 'Codcompass - Premium Knowledge Base for Developers',
    template: '%s | Codcompass',
  },
  description: 'High-quality technical tutorials, code examples, and expert insights for developers. Learn React, TypeScript, Next.js, AI/ML, and DevOps.',
  keywords: ['developer', 'programming', 'React', 'TypeScript', 'Next.js', 'AI', 'DevOps', 'tutorial', 'code examples'],
  authors: [{ name: 'Codcompass Team' }],
  creator: 'Codcompass',
  publisher: 'Codcompass',
  metadataBase: new URL('https://www.codcompass.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['en_GB', 'zh_CN'],
    siteName: 'Codcompass',
    title: 'Codcompass - Premium Knowledge Base for Developers',
    description: 'High-quality technical tutorials, code examples, and expert insights for developers.',
    url: 'https://www.codcompass.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Codcompass - Developer Knowledge Base',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@codcompass',
    creator: '@codcompass',
    title: 'Codcompass - Premium Knowledge Base for Developers',
    description: 'High-quality technical tutorials, code examples, and expert insights for developers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'MFJ-bpEFixfhNFHsdOO9gDf50oEVY1d129F-9gSse60',
  },
  other: {
    'google-site-verification': 'MFJ-bpEFixfhNFHsdOO9gDf50oEVY1d129F-9gSse60',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <GoogleAnalytics gaId="G-F3G2ZECQ0V" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
