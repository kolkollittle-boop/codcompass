/**
 * Get locale from URL path in Next.js 15
 * Works with middleware routing
 */
import { headers } from 'next/headers';
import { Locale, locales } from './i18n';

export async function getLocaleFromPath(): Promise<Locale> {
  const headersList = await headers();
  const pathname = headersList.get('x-middleware-request-pathname') || '';
  
  // Extract locale from path like /en/kb or /zh/kb
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];
  
  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  
  return 'en';
}
