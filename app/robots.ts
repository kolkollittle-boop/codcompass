import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/login',
          '/signup',
          '/dashboard/',
          '/search',
          '/patients/',
          '/conductor:',
          '/opt/',
          '/mnt/',
          '/local-only/',
          '/auth/',
          '/checkout/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://www.codcompass.com/sitemap.xml',
  };
}
