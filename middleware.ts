import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

// Files that should not be processed by the middleware
const excludedPaths = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/logo.png',
  '/api/',
  '/_next/',
  '/static/',
  '/terms',
  '/privacy',
  '/refund',
  '/checkout',
  '/pricing',
  '/blog',
  '/about',
  '/contact',
  '/help',
  '/login',
  '/local-only', // gitignored local crawler UI; must not locale-rewrite
  '/signup', // allow signup
  '/dashboard',
  '/admin',
  '/status',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Home: marketing landing
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Bare /en or /zh → home + locale cookie (no longer forced to KB)
  if (pathname === '/en' || pathname === '/zh') {
    const loc = pathname.slice(1);
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const res = NextResponse.redirect(url);
    res.cookies.set('NEXT_LOCALE', loc, { path: '/' });
    return res;
  }

  // Skip excluded paths
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get locale from cookie
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;

  // Rewrite to localized path (internal redirect)
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  const response = NextResponse.rewrite(url);
  // Set locale header for page components to read
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
