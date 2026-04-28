import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling heavy Node.js libraries
  // These are only used by CLI scripts, not the web app
  serverExternalPackages: ['turndown', 'cheerio'],
  
  // Ensure react-resizable-panels is bundled correctly
  transpilePackages: ['react-resizable-panels'],

  experimental: {
    typedRoutes: true,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS filter
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self'`,
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.lemonsqueezy.com https://www.googletagmanager.com https://*.google-analytics.com`,
              `style-src 'self' 'unsafe-inline'`,
              `img-src 'self' data: https:`,
              `font-src 'self'`,
              `connect-src 'self' https://*.supabase.co https://*.lemonsqueezy.com https://*.google-analytics.com`,
              `frame-ancestors 'none'`,
              `base-uri 'self'`,
              `form-action 'self'`,
            ].join('; '),
          },
          // HSTS (only on HTTPS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;