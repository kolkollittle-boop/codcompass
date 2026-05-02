import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow local.codcompass.com for development
  allowedDevOrigins: ['local.codcompass.com'],

  /** Ensure admin crawler route can spawn local `tsx` + TypeScript sources on Vercel (NFT). */
  outputFileTracingIncludes: {
    '/api/admin/crawler': [
      './node_modules/tsx/**/*',
      './automation/crawler/src/**/*',
    ],
  },

  // Prevent Next.js from bundling heavy Node.js libraries
  // These are only used by CLI scripts, not the web app
  serverExternalPackages: ['turndown', 'cheerio', 'tsx'],
  
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
            value: 'SAMEORIGIN',
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
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com https://challenges.cloudflare.com https://cdn.paddle.com https://*.paddle.com https://public.profitwell.com`,
              `script-src-elem 'self' 'unsafe-inline' https://cdn.paddle.com https://*.paddle.com https://public.profitwell.com https://www.googletagmanager.com https://*.google-analytics.com`,
              `style-src 'self' 'unsafe-inline' https://cdn.paddle.com`,
              `style-src-elem 'self' 'unsafe-inline' https://cdn.paddle.com`,
              `frame-src 'self' https://challenges.cloudflare.com https://*.paddle.com https://buy.paddle.com https://checkout-service.paddle.com`,
              `img-src 'self' data: https:`,
              `font-src 'self'`,
              `connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.paddle.com https://checkout-service.paddle.com`,
              `frame-ancestors 'self' https://buy.paddle.com https://*.paddle.com`,
              `base-uri 'self'`,
              `form-action 'self' https://*.paddle.com https://buy.paddle.com https://checkout-service.paddle.com`,
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