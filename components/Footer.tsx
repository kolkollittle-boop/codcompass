import Link from 'next/link';

interface FooterProps {
  locale?: string;
  /** KB / docs: deep footer matching docs-shell */
  variant?: 'default' | 'docs';
}

const excludedPaths = [
  '/blog', '/pricing', '/about', '/contact', '/help',
  '/login', '/dashboard', '/admin', '/checkout',
  '/status', '/privacy', '/terms', '/refund',
];

const linkWithLocale = (locale: string, path: string) => {
  if (excludedPaths.some(ep => path.startsWith(ep))) return path;
  if (path.startsWith('/api/') || path.startsWith('/auth/')) return path;
  return `/${locale}${path}`;
};

export default function Footer({ locale = 'en', variant = 'default' }: FooterProps) {
  // Always use English translations for site-wide English
  const t = {
    description: 'Premium knowledge base for developers and professionals.',
    product: 'Product',
    kb: 'Knowledge Base',
    blog: 'Blog',
    pricing: 'Pricing',
    checkout: 'Checkout',
    help: 'Help Center',
    company: 'Company',
    about: 'About',
    contact: 'Contact',
    status: 'Status',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    rights: 'All rights reserved.',
  };

  const linkClass =
    variant === 'docs'
      ? 'text-base text-zinc-500 hover:text-white'
      : 'text-base text-palette-textMuted hover:text-palette-textPrimary';
  const headingClass =
    variant === 'docs'
      ? 'text-sm font-semibold text-zinc-500 uppercase tracking-wider'
      : 'text-sm font-semibold text-palette-textMuted uppercase tracking-wider';
  const footBorder = variant === 'docs' ? 'border-docs-border' : 'border-palette-border';
  const mutedText = variant === 'docs' ? 'text-zinc-500' : 'text-palette-textMuted';

  return (
    <footer
      className={
        variant === 'docs'
          ? 'border-t border-docs-border bg-docs-surface text-zinc-400'
          : 'border-t border-palette-border bg-palette-bgSecondary'
      }
    >
      <div className="max-w-site mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className={headingClass}>Codcompass</h3>
            <p className={`mt-4 text-base ${mutedText}`}>{t.description}</p>
          </div>
          <div>
            <h3 className={headingClass}>{t.product}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/kb') as any} className={linkClass}>
                  {t.kb}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/blog') as any} className={linkClass}>
                  {t.blog}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/pricing') as any} className={linkClass}>
                  {t.pricing}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/checkout') as any} className={linkClass}>
                  {t.checkout}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/help') as any} className={linkClass}>
                  {t.help}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={headingClass}>{t.company}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/about') as any} className={linkClass}>
                  {t.about}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/contact') as any} className={linkClass}>
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/status') as any} className={linkClass}>
                  {t.status}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={headingClass}>{t.legal}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/privacy') as any} className={linkClass}>
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/terms') as any} className={linkClass}>
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={`mt-8 border-t ${footBorder} pt-8 md:flex md:items-center md:justify-between`}>
          <div className="flex space-x-6 md:order-2">
            {/* Social media icons would go here */}
          </div>
          <p className={`mt-8 text-base md:mt-0 md:order-1 ${mutedText}`}>
            &copy; {new Date().getFullYear()} Codcompass. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
