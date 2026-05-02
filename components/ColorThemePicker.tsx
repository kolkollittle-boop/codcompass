'use client';

import {
  applyColorTheme,
  COLOR_THEME_CLASSES,
  COLOR_THEME_STORAGE_KEY,
  type ColorThemeClass,
  readStoredColorTheme,
} from '@/lib/color-theme';
import { useEffect, useState } from 'react';

const OPTIONS: { id: ColorThemeClass; label: string; hint: string }[] = [
  { id: 'theme-blue-purple', label: 'Blue + purple', hint: 'Balanced tech default' },
  { id: 'theme-cyan-dark', label: 'Cyan dark', hint: 'Deep space / hacker' },
  { id: 'theme-emerald-cyan', label: 'Emerald + cyan', hint: 'Matrix / code vibe' },
];

export default function ColorThemePicker() {
  const [active, setActive] = useState<ColorThemeClass>('theme-blue-purple');

  useEffect(() => {
    const sync = () => {
      const stored = readStoredColorTheme();
      if (stored) setActive(stored);
      else {
        for (const c of COLOR_THEME_CLASSES) {
          if (document.documentElement.classList.contains(c)) {
            setActive(c);
            break;
          }
        }
      }
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === COLOR_THEME_STORAGE_KEY) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const select = (id: ColorThemeClass) => {
    applyColorTheme(id);
    setActive(id);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-palette-textMuted">
        Applies site-wide accent and surface tokens (Tailwind <code className="text-xs text-palette-textSecondary">palette-*</code> /{' '}
        <code className="text-xs text-palette-textSecondary">theme.*</code>).
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => select(opt.id)}
            className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
              active === opt.id
                ? 'border-palette-primary bg-palette-bgTertiary shadow-[0_0_0_1px_var(--primary)]'
                : 'border-palette-border bg-palette-bgCard hover:border-palette-primary'
            }`}
          >
            <span className="font-medium text-palette-textPrimary">{opt.label}</span>
            <span className="mt-1 block text-xs text-palette-textMuted">{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
