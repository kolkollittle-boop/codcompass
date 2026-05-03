import type { Config } from 'tailwindcss';

/**
 * CloudQuery-style tokens (see repo root `cloudquery-cursor-prompt.md`)
 * → `bg-docs-bg`, `text-docs-accent`, `border-docs-border`, etc.
 */
const docs = {
  bg: '#0E1320',
  surface: '#111927',
  surfaceAlt: '#15202E',
  border: '#29303D',
  borderHover: '#3d4a63',
  code: '#1C2536',
  accent: '#17B264',
  accentHover: '#27CA40',
  greenDark: '#022723',
  /** rgba(23, 178, 100, 0.1) */
  greenSubtle: 'rgb(23 178 100 / 0.1)',
  heading: '#EDF2F7',
  body: '#D2D6DB',
  secondary: '#C8CBD0',
  muted: '#6C737F',
  faint: '#5C6370',
  linkBlue: '#61AFEF',
} as const;

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        /** Site max content width (KB sidebar + article column) */
        site: '1200px',
      },
      width: {
        /** KB left nav width → `w-docs-sidebar` */
        'docs-sidebar': '280px',
        /** Desktop right TOC → `w-docs-toc` */
        'docs-toc': '240px',
      },
      boxShadow: {
        'cc-theme': '0 0 20px color-mix(in srgb, var(--primary) 22%, transparent)',
        'cc-theme-lg': '0 0 40px color-mix(in srgb, var(--primary) 30%, transparent)',
      },
      colors: {
        /** KB: bg / surface / border / border-hover / code */
        docs: {
          bg: docs.bg,
          surface: docs.surface,
          'surface-alt': docs.surfaceAlt,
          border: docs.border,
          'border-hover': docs.borderHover,
          code: docs.code,
          accent: docs.accent,
          'accent-hover': docs.accentHover,
          'green-dark': docs.greenDark,
          'green-subtle': docs.greenSubtle,
          heading: docs.heading,
          body: docs.body,
          secondary: docs.secondary,
          muted: docs.muted,
          faint: docs.faint,
          'link-blue': docs.linkBlue,
        },
        // Codcompass theme system — CSS variables
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
        // Legacy primary scale
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
      typography: ({ theme }: { theme: (key: string) => string }) => ({
        DEFAULT: {
          css: {
            maxWidth: '75ch',
          },
        },
        invert: {
          css: {
            maxWidth: '75ch',
            '--tw-prose-invert-body': docs.body,
            '--tw-prose-invert-headings': docs.heading,
            '--tw-prose-invert-lead': docs.muted,
            '--tw-prose-invert-bold': docs.heading,
            '--tw-prose-invert-links': docs.accent,
            '--tw-prose-invert-code': docs.body,
            '--tw-prose-invert-pre-code': docs.body,
            '--tw-prose-invert-pre-bg': docs.code,
            h1: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            h2: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            h3: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            h4: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            code: {
              backgroundColor: docs.code,
              borderRadius: '4px',
              paddingTop: '0.125em',
              paddingRight: '0.375em',
              paddingBottom: '0.125em',
              paddingLeft: '0.375em',
              fontWeight: '400',
            },
            pre: {
              borderRadius: '4px',
              backgroundColor: docs.code,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
