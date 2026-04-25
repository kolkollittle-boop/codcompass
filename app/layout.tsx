import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Codcompass - Premium Knowledge Base for Developers',
  description: 'High-quality technical tutorials and resources for developers and professionals.',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
