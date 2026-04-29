// Cloudflare Turnstile 类型声明
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  tabindex?: number;
  'error-callback'?: () => void;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'before-interactive-callback'?: () => void;
  'after-interactive-callback'?: () => void;
  'unsupported-callback'?: () => void;
  appearance?: 'always' | 'execute' | 'interaction-only';
  execution?: 'render' | 'execute';
  refreshExpired?: 'auto' | 'manual' | 'never';
  retry?: 'auto' | 'never';
  refreshTimeout?: number;
  size?: 'normal' | 'compact' | 'flexible';
  responseField?: boolean;
  responseFieldName?: string;
  retryInterval?: number;
  appearanceCallback?: () => void;
  contentSize?: 'normal' | 'compact';
  action?: string;
  cData?: string;
  preflight?: boolean;
}

interface Turnstile {
  render(container: string | HTMLElement, options: TurnstileOptions): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
  getResponse(widgetId?: string): string | undefined;
  getResponseContainer(widgetId?: string): HTMLElement | null;
  execute(widgetId?: string): void;
  expire(widgetId?: string): void;
  isExpired(widgetId?: string): boolean;
}

interface Window {
  turnstile: Turnstile;
  onloadTurnstile?: () => void;
}
