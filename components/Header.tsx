'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar';
import { Icon } from './ui';
import { cn } from '@/lib/utils';

interface HeaderProps {
  locale?: string;
}

// These routes are excluded from locale handling (per middleware.ts)
const excludedPaths = [
  '/blog', '/pricing', '/about', '/contact', '/help',
  '/login', '/dashboard', '/admin', '/checkout',
];

const linkWithLocale = (locale: string, path: string) => {
  // Don't prefix excluded routes (these live outside locale layout)
  if (excludedPaths.some(ep => path.startsWith(ep))) return path;
  // Don't prefix auth/callback routes
  if (path.startsWith('/api/') || path.startsWith('/auth/')) return path;
  return `/${locale}${path}`;
};

/** Marketing + KB share the CQ-style top bar; tree nav only inside KB docs */
function isCqMarketingShell(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === '/') return true;
  const roots = ['/blog', '/pricing', '/about', '/contact', '/help', '/status'];
  return roots.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export default function Header({ locale = 'en' }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const isKbDocs = pathname?.includes('/kb');
  const cqShell = isCqMarketingShell(pathname);
  const isDarkShell = !!isKbDocs || cqShell;

  const onBlog =
    pathname === '/blog' ||
    !!pathname?.startsWith('/blog/') ||
    !!pathname?.startsWith(`/${locale}/blog`);
  const onPricing = pathname === '/pricing' || pathname === `/${locale}/pricing`;
  const onAbout = pathname === '/about' || pathname === `/${locale}/about`;

  /** `/en/kb`, `/zh/kb`, or rewritten `/kb`; not `/kb/categories` or `kb-foo` segments */
  const p = pathname ?? '';
  const onKbCategories = p.includes('/kb/categories');
  const onKbMain =
    !onKbCategories &&
    (p === '/kb' ||
      p.startsWith('/kb/') ||
      /^\/(en|zh)\/kb(\/|$)/.test(p));

  // Always use English translations for site-wide English
  const t = {
    kb: 'Knowledge Base',
    categories: 'Categories',
    blog: 'Blog',
    pricing: 'Pricing',
    about: 'About',
    dashboard: 'Dashboard',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
    admin: 'Admin Panel',
    signOut: 'Sign Out',
    signIn: 'Sign in',
    getStarted: 'Get Started',
  };

  const navInactive = isDarkShell
    ? 'border-transparent text-docs-secondary hover:rounded-md hover:bg-white/5 hover:text-docs-heading'
    : 'border-transparent text-palette-textMuted hover:border-palette-border hover:text-palette-textPrimary';
  const navActive = isDarkShell
    ? 'border-docs-accent text-docs-accent'
    : 'border-palette-primary text-palette-textPrimary';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b',
        isDarkShell
          ? 'border-docs-border bg-docs-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-docs-bg/90'
          : 'border-palette-border bg-palette-bgSecondary',
      )}
    >
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href={'/' as any}
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  isDarkShell ? 'text-docs-heading' : 'text-palette-primary',
                )}
              >
                Codcompass
              </Link>
            </div>
            <nav className="ml-8 flex space-x-6">
              <Link
                href={linkWithLocale(locale, '/kb') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  onKbMain ? navActive : navInactive
                }`}
              >
                {t.kb}
              </Link>
              <Link
                href={linkWithLocale(locale, '/kb/categories') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  onKbCategories ? navActive : navInactive
                }`}
              >
                {t.categories}
              </Link>
              <Link
                href={linkWithLocale(locale, '/blog') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  onBlog ? navActive : navInactive
                }`}
              >
                {t.blog}
              </Link>
              <Link
                href={linkWithLocale(locale, '/pricing') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  onPricing ? navActive : navInactive
                }`}
              >
                {t.pricing}
              </Link>
              <Link
                href={linkWithLocale(locale, '/about') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  onAbout ? navActive : navInactive
                }`}
              >
                {t.about}
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3 flex-1 max-w-lg">
            <SearchBar />
            <LanguageSwitcher />
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={cn(
                    'flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors',
                    isDarkShell ? 'hover:bg-white/5' : 'hover:bg-palette-bgTertiary',
                  )}
                >
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDarkShell ? 'text-docs-secondary' : 'text-palette-textSecondary',
                    )}
                  >
                    {session.user?.name || 'User'}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={16}
                    className={isDarkShell ? 'text-docs-muted' : 'text-palette-textMuted'}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className={cn(
                      'absolute right-0 z-50 mt-2 w-48 rounded-lg border py-2 shadow-lg',
                      isDarkShell
                        ? 'border-docs-border bg-docs-surface'
                        : 'border-palette-border bg-palette-bgCard',
                    )}
                  >
                    <div
                      className={cn(
                        'border-b px-4 py-2',
                        isDarkShell ? 'border-docs-border' : 'border-palette-border',
                      )}
                    >
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isDarkShell ? 'text-white' : 'text-palette-textPrimary',
                        )}
                      >
                        {session.user?.name}
                      </p>
                      <p className={cn('text-xs', isDarkShell ? 'text-docs-muted' : 'text-palette-textMuted')}>
                        {session.user?.email}
                      </p>
                      <span
                        className={cn(
                          'mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                          isDarkShell
                            ? 'border border-docs-border bg-white/5 text-docs-secondary'
                            : 'bg-palette-bgTertiary text-palette-primary',
                        )}
                      >
                        {(session.user as any)?.role || 'USER'}
                      </span>
                    </div>
                    <Link
                      href={linkWithLocale(locale, '/dashboard') as any}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm',
                        isDarkShell
                          ? 'text-docs-body hover:bg-white/5 hover:text-docs-heading'
                          : 'text-palette-textSecondary hover:bg-palette-bgTertiary',
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="dashboard" size={16} className={isDarkShell ? 'text-docs-muted' : 'text-palette-textMuted'} />
                      {t.dashboard}
                    </Link>
                    <Link
                      href={linkWithLocale(locale, '/dashboard/bookmarks') as any}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm',
                        isDarkShell
                          ? 'text-docs-body hover:bg-white/5 hover:text-docs-heading'
                          : 'text-palette-textSecondary hover:bg-palette-bgTertiary',
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="bookmark" size={16} className={isDarkShell ? 'text-docs-muted' : 'text-palette-textMuted'} />
                      {t.bookmarks}
                    </Link>
                    <Link
                      href={linkWithLocale(locale, '/dashboard/settings') as any}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm',
                        isDarkShell
                          ? 'text-docs-body hover:bg-white/5 hover:text-docs-heading'
                          : 'text-palette-textSecondary hover:bg-palette-bgTertiary',
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="settings" size={16} className={isDarkShell ? 'text-docs-muted' : 'text-palette-textMuted'} />
                      {t.settings}
                    </Link>
                    {isAdmin && (
                      <>
                        <div
                          className={cn('my-1 border-t', isDarkShell ? 'border-docs-border' : 'border-palette-border')}
                        />
                        <Link
                          href={linkWithLocale(locale, '/admin') as any}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 text-sm',
                            isDarkShell
                              ? 'text-docs-heading hover:bg-white/5 hover:text-white'
                              : 'text-palette-primary hover:bg-palette-bgTertiary',
                          )}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Icon
                            name="shield"
                            size={16}
                            className={isDarkShell ? 'text-docs-body' : 'text-palette-primary'}
                          />
                          {t.admin}
                        </Link>
                      </>
                    )}
                    <div
                      className={cn('my-1 border-t', isDarkShell ? 'border-docs-border' : 'border-palette-border')}
                    />
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setShowUserMenu(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600',
                        isDarkShell ? 'hover:bg-white/5' : 'hover:bg-palette-bgTertiary',
                      )}
                    >
                      <Icon name="log-out" size={16} className="text-red-500" />
                      {t.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href={linkWithLocale(locale, '/login') as any}
                  className={cn(
                    'inline-flex items-center px-4 py-2 text-sm font-medium',
                    isDarkShell
                      ? 'text-docs-body hover:text-docs-heading'
                      : 'text-palette-textSecondary hover:text-palette-textPrimary',
                  )}
                >
                  {t.signIn}
                </Link>
                <Link
                  href={linkWithLocale(locale, '/pricing') as any}
                  className={cn(
                    'inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors',
                    isKbDocs
                      ? 'bg-docs-accent text-white hover:bg-docs-accent-hover'
                      : cqShell
                        ? 'bg-docs-accent text-white hover:bg-docs-accent-hover'
                        : 'bg-palette-primary text-white hover:bg-palette-primary-hover',
                  )}
                >
                  {t.getStarted}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
