import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Codcompass Theme System - 使用 CSS 变量
        theme: {
          background: 'hsl(var(--codcompass-background) / <alpha-value>)',
          surface: 'hsl(var(--codcompass-surface) / <alpha-value>)',
          'surface-hover': 'hsl(var(--codcompass-surface-hover) / <alpha-value>)',
          text: {
            primary: 'hsl(var(--codcompass-text-primary) / <alpha-value>)',
            secondary: 'hsl(var(--codcompass-text-secondary) / <alpha-value>)',
            muted: 'hsl(var(--codcompass-text-muted) / <alpha-value>)',
          },
          border: {
            DEFAULT: 'hsl(var(--codcompass-border) / <alpha-value>)',
            hover: 'hsl(var(--codcompass-border-hover) / <alpha-value>)',
          },
          brand: {
            DEFAULT: 'hsl(var(--codcompass-brand) / <alpha-value>)',
            light: 'hsl(var(--codcompass-brand-light) / <alpha-value>)',
            dark: 'hsl(var(--codcompass-brand-dark) / <alpha-value>)',
            glow: 'hsl(var(--codcompass-brand-glow) / <alpha-value>)',
            bg: 'hsl(var(--codcompass-brand-bg) / <alpha-value>)',
          },
          accent: {
            purple: 'hsl(var(--codcompass-accent-purple) / <alpha-value>)',
            'purple-bg': 'hsl(var(--codcompass-accent-purple-bg) / <alpha-value>)',
            cyan: 'hsl(var(--codcompass-accent-cyan) / <alpha-value>)',
            'cyan-bg': 'hsl(var(--codcompass-accent-cyan-bg) / <alpha-value>)',
            green: 'hsl(var(--codcompass-accent-green) / <alpha-value>)',
            'green-bg': 'hsl(var(--codcompass-accent-green-bg) / <alpha-value>)',
            amber: 'hsl(var(--codcompass-accent-amber) / <alpha-value>)',
            'amber-bg': 'hsl(var(--codcompass-accent-amber-bg) / <alpha-value>)',
            red: 'hsl(var(--codcompass-accent-red) / <alpha-value>)',
            'red-bg': 'hsl(var(--codcompass-accent-red-bg) / <alpha-value>)',
          },
        },
        /* CSS variable palettes (html.theme-*) — see app/themes.css */
        palette: {
          primary: 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          bgPrimary: 'var(--bg-primary)',
          bgSecondary: 'var(--bg-secondary)',
          bgCard: 'var(--bg-card)',
          bgTertiary: 'var(--bg-tertiary)',
          textPrimary: 'var(--text-primary)',
          textSecondary: 'var(--text-secondary)',
          textMuted: 'var(--text-muted)',
          success: 'var(--success)',
          border: 'var(--border)',
          codeBg: 'var(--code-bg, var(--bg-secondary))',
          matrixGlow: 'var(--matrix-glow, transparent)',
        },
        // 保留原有的 primary 配色
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d7fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
