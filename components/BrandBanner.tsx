'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BrandBannerProps {
  variant?: 'topbar' | 'hero' | 'inline';
  onClose?: () => void;
}

const translations = {
  en: {
    badge: 'New',
    title: 'Codcompass 2.0 is here',
    description: 'Production-grade Blueprints, Pitfall Checklists, and Learning Paths — built for developers who ship.',
    cta: 'Explore Now',
  },
  zh: {
    badge: 'New',
    title: 'Codcompass 2.0 is here',
    description: 'Production-grade Blueprints, Pitfall Checklists, and Learning Paths — built for developers who ship.',
    cta: 'Explore Now',
  },
};

export default function BrandBanner({ variant = 'topbar', onClose }: BrandBannerProps) {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Read locale preference from cookie
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as 'en' | 'zh' | undefined;
    if (savedLocale) setLocale(savedLocale);
  }, []);

  const t = translations[locale];

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  if (variant === 'topbar') {
    return (
      <div className="relative bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] text-white">
        <div className="max-w-site mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{t.badge}</span>
            <span className="text-sm">{t.description}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={"/kb" as any}
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {onClose && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[color-mix(in_srgb,var(--primary)_72%,black)] text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-site mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4" />
              {t.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-palette-textSecondary max-w-2xl mx-auto mb-10">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={"/kb" as any}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-palette-primary font-semibold hover:bg-palette-bgTertiary transition-colors"
              >
                {t.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className="relative bg-palette-bgCard border border-white/[0.08] rounded-2xl p-8 my-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-palette-bgTertiary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-palette-primary" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-palette-bgTertiary text-palette-primary border border-palette-primary mb-3">
            {t.badge}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.title}</h3>
          <p className="text-palette-textMuted">{t.description}</p>
        </div>
        <Link
          href={"/kb" as any}
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-palette-primary text-white font-medium hover:bg-palette-primary-hover transition-colors"
        >
          {t.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
