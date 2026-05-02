'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar';
import { Icon } from './ui';

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

export default function Header({ locale = 'en' }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

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

  const navInactive =
    'border-transparent text-palette-textMuted hover:border-palette-border hover:text-palette-textPrimary';
  const navActive = 'border-palette-primary text-palette-textPrimary';

  return (
    <header className="bg-palette-bgSecondary border-b border-palette-border sticky top-0 z-50">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${locale}` as any} className="text-2xl font-bold text-palette-primary tracking-tight">
                Codcompass
              </Link>
            </div>
            <nav className="ml-8 flex space-x-6">
              <Link
                href={linkWithLocale(locale, '/kb') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname?.startsWith(`/${locale}/kb`) && !pathname?.startsWith(`/${locale}/kb/categories`)
                    ? navActive
                    : navInactive
                }`}
              >
                {t.kb}
              </Link>
              <Link
                href={linkWithLocale(locale, '/kb/categories') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname?.startsWith(`/${locale}/kb/categories`) ? navActive : navInactive
                }`}
              >
                {t.categories}
              </Link>
              <Link
                href={linkWithLocale(locale, '/blog') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname?.startsWith(`/${locale}/blog`) ? navActive : navInactive
                }`}
              >
                {t.blog}
              </Link>
              <Link
                href={linkWithLocale(locale, '/pricing') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === `/${locale}/pricing` ? navActive : navInactive
                }`}
              >
                {t.pricing}
              </Link>
              <Link
                href={linkWithLocale(locale, '/about') as any}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === `/${locale}/about` ? navActive : navInactive
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
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-palette-bgTertiary transition-colors"
                >
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-palette-textSecondary">
                    {session.user?.name || 'User'}
                  </span>
                  <Icon name="chevron-down" size={16} className="text-palette-textMuted" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-palette-bgCard rounded-lg shadow-lg border border-palette-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-palette-border">
                      <p className="text-sm font-medium text-palette-textPrimary">{session.user?.name}</p>
                      <p className="text-xs text-palette-textMuted">{session.user?.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-palette-bgTertiary text-palette-primary mt-1">
                        {(session.user as any)?.role || 'USER'}
                      </span>
                    </div>
                    <Link
                      href={linkWithLocale(locale, '/dashboard') as any}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-palette-textSecondary hover:bg-palette-bgTertiary"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="dashboard" size={16} className="text-palette-textMuted" />
                      {t.dashboard}
                    </Link>
                    <Link
                      href={linkWithLocale(locale, '/dashboard/bookmarks') as any}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-palette-textSecondary hover:bg-palette-bgTertiary"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="bookmark" size={16} className="text-palette-textMuted" />
                      {t.bookmarks}
                    </Link>
                    <Link
                      href={linkWithLocale(locale, '/dashboard/settings') as any}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-palette-textSecondary hover:bg-palette-bgTertiary"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="settings" size={16} className="text-palette-textMuted" />
                      {t.settings}
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-palette-border my-1"></div>
                        <Link
                          href={linkWithLocale(locale, '/admin') as any}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-palette-primary hover:bg-palette-bgTertiary"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Icon name="shield" size={16} className="text-palette-primary" />
                          {t.admin}
                        </Link>
                      </>
                    )}
                    <div className="border-t border-palette-border my-1"></div>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: `/${locale}` });
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-palette-bgTertiary"
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-palette-textSecondary hover:text-palette-textPrimary"
                >
                  {t.signIn}
                </Link>
                <Link
                  href={linkWithLocale(locale, '/pricing') as any}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-palette-primary hover:bg-palette-primary-hover transition-colors"
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
