import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const COLOR_THEME_BOOT = `(function(){try{var K='codcompass-color-theme';var C=['theme-blue-purple','theme-cyan-dark','theme-emerald-cyan'];var v=localStorage.getItem(K);var r=document.documentElement;for(var i=0;i<C.length;i++)r.classList.remove(C[i]);r.classList.add(C.indexOf(v)>=0?v:C[0]);}catch(e){}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white antialiased">
        <Script id="codcompass-color-theme" strategy="beforeInteractive">
          {COLOR_THEME_BOOT}
        </Script>
        <GoogleAnalytics gaId="G-F3G2ZECQ0V" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
