/**
 * i18n utilities for Codcompass
 * Supports English (en) and Chinese (zh)
 */

export type Locale = 'en' | 'zh';

export const locales: Locale[] = ['en', 'zh'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
};

/**
 * Get locale from cookie (client-side)
 */
export function getLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
  if (!localeCookie) return null;
  const value = localeCookie.split('=')[1];
  return locales.includes(value as Locale) ? value as Locale : null;
}

/**
 * Set locale cookie
 */
export function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Get article content for a specific locale
 * Falls back to English if translation doesn't exist
 */
export interface ArticleContent {
  title: string;
  content: string;
  excerpt: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export function getArticleContent(
  article: {
    titleEn: string;
    contentEn: string;
    excerptEn: string | null;
    descriptionEn: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    translations?: Array<{
      locale: string;
      title: string;
      content: string;
      excerpt: string | null;
      description: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
    }>;
  },
  locale: Locale
): ArticleContent {
  if (locale === 'en') {
    return {
      title: article.titleEn,
      content: article.contentEn,
      excerpt: article.excerptEn || '',
      description: article.descriptionEn || '',
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
    };
  }

  // For Chinese, try to find translation
  const translation = article.translations?.find(t => t.locale === 'zh');
  if (translation && translation.content) {
    return {
      title: translation.title,
      content: translation.content,
      excerpt: translation.excerpt || '',
      description: translation.description || '',
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
    };
  }

  // Fallback to English
  return {
    title: article.titleEn,
    content: article.contentEn,
    excerpt: article.excerptEn || '',
    description: article.descriptionEn || '',
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
  };
}
