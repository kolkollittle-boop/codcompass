import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CPKB - Premium Knowledge Base for Developers',
  description: 'High-quality technical tutorials and resources for developers and professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
