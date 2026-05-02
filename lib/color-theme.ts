export const COLOR_THEME_CLASSES = [
  'theme-blue-purple',
  'theme-cyan-dark',
  'theme-emerald-cyan',
] as const;

export type ColorThemeClass = (typeof COLOR_THEME_CLASSES)[number];

export const COLOR_THEME_STORAGE_KEY = 'codcompass-color-theme';

export const DEFAULT_COLOR_THEME: ColorThemeClass = 'theme-blue-purple';

export function isColorThemeClass(value: string): value is ColorThemeClass {
  return (COLOR_THEME_CLASSES as readonly string[]).includes(value);
}

export function applyColorTheme(theme: ColorThemeClass) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const c of COLOR_THEME_CLASSES) {
    root.classList.remove(c);
  }
  root.classList.add(theme);
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function readStoredColorTheme(): ColorThemeClass | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    if (v && isColorThemeClass(v)) return v;
  } catch {
    /* ignore */
  }
  return null;
}
