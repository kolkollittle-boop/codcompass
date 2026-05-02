'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { locales, localeNames, localeFlags, setLocaleCookie } from '@/lib/i18n';

// Pages that don't use locale routing (per middleware.ts)
const nonLocalePaths = ['/blog', '/pricing', '/about', '/contact', '/help',
  '/login', '/dashboard', '/admin', '/checkout', '/status', '/privacy', '/terms', '/refund'];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current page uses locale routing
  const usesLocaleRouting = !nonLocalePaths.some(p => pathname.startsWith(p));

  // Get current locale from pathname (fallback to cookie for non-locale pages)
  const currentLocale = usesLocaleRouting
    ? (locales.find(locale => pathname.startsWith(`/${locale}/`)) || 'en')
    : 'en';

  // Get path without locale prefix
  const pathWithoutLocale = usesLocaleRouting
    ? pathname.replace(/^\/(en|zh)/, '') || '/'
    : pathname;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (locale: string) => {
    setLocaleCookie(locale as any);
    
    // Navigate to the same path with new locale (or keep path for non-locale pages)
    const newPath = usesLocaleRouting ? `/${locale}${pathWithoutLocale}` : pathWithoutLocale;
    router.push(newPath as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-palette-textMuted hover:text-palette-textPrimary hover:bg-palette-bgTertiary rounded-lg transition-colors"
        aria-label="Switch language"
      >
        <span>{localeFlags[currentLocale]}</span>
        <span>{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-palette-bgCard rounded-lg shadow-lg border border-palette-border py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                locale === currentLocale
                  ? 'bg-palette-bgTertiary text-palette-primary font-medium'
                  : 'text-palette-textSecondary hover:bg-palette-bgTertiary'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 ml-auto text-palette-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
