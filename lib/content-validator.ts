/**
 * Content Validation & Cleaning Pipeline
 *
 * Validates article content BEFORE insertion into the database.
 * Catches: raw Markdown leakage, low-quality content, promotional text,
 * inappropriate sources, and formatting issues.
 *
 * Used by: /api/articles POST, seed scripts, crawl-and-process pipeline.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  cleanedContent?: string;
}

// ── Markdown leakage patterns ──────────────────────────────────────────────
const MARKDOWN_PATTERNS = [
  { pattern: /\[.*?\]\(#.*?\)/g, name: 'Markdown anchor links' },
  { pattern: /\*\s*\*\s*\*/g, name: 'Unrendered horizontal rules (* * *)' },
  { pattern: /^---$/gm, name: 'Unrendered horizontal rules (---)' },
  { pattern: /!\[.*?\]\(.*?\)/g, name: 'Unrendered image syntax' },
  { pattern: /`{3,}[\s\S]*?`{3,}/g, name: 'Markdown code blocks (should be <pre><code>)' },
  { pattern: /^\s*[-*]\s+/gm, name: 'Markdown list items (should be <li>)' },
  { pattern: /^\s*#{1,6}\s+.+$/gm, name: 'Markdown headings (should be <h1>-<h6>)' },
];

// ── Content quality red flags ──────────────────────────────────────────────
const PROMOTIONAL_PATTERNS = [
  // GitHub / Open Source promotion
  /star\s+the\s+repo/i,
  /pick\s+an?\s+issue/i,
  /we['']re\s+on\s+\[?GitHub/i,
  /we['']d\s+love\s+contributors/i,
  /draft\s+PR/i,
  /fork\s+and\s+experiment/i,
  /building\s+in\s+public/i,
  /good\s+first\s+issue/i,
  /contribute.*roadmap/i,

  // Course / Product sales
  /\bcheck\s+out\s+(my|our)\s+(course|book|ebook|guide|tutorial|product)/i,
  /\b(enroll|buy|purchase|get)\s+(now|today|your|access)/i,
  /limited\s+(time|offer|discount|spots?)/i,
  /special\s+offer|exclusive\s+deal/i,
  /save\s+\d+%\s+(today|now)/i,
  /\buse\s+code\s+\w+\s+(for|to|get|at)/i,
  /\baffiliate\s+(link|commission|partner|program)/i,
  /sponsored\s+(by|post|content|article)/i,
  /paid\s+(promotion|partnership|collaboration)/i,
  /this\s+post\s+contains\s+(affiliate|sponsored|paid)/i,
  /as\s+an?\s+(amazon|affiliate)\s+(partner|associate)/i,
  /i\s+earn\s+(a\s+)?commission/i,
  /buy\s+me\s+(a\s+)?coffee/i,
  /support\s+me\s+(on\s+)?(patreon|ko-fi|buy\s*me\s*a\s*coffee)/i,

  // Newsletter / Community growth
  /join\s+(my|our)\s+(newsletter|discord|telegram|whatsapp|slack|community)/i,
  /subscribe\s+(to\s+)?(my|our)\s+(newsletter|channel|blog|feed)/i,
  /follow\s+(me|us)\s+(on\s+)?(twitter|x|linkedin|youtube|instagram)/i,
  /don['']t\s+miss\s+(out\s+)?(on|a)/i,
  /sign\s+up\s+(today|now|for)/i,
  /free\s+(guide|cheat\s*sheet|resource|template|ebook|course)/i,

  // Self-promotion / Personal branding
  /\bi['']m?\s+(the\s+)?(founder|creator|author|owner|developer)\s+(of|at|behind)/i,
  /my\s+(startup|company|product|app|tool|platform)/i,
  /we['']re\s+(building|launching|releasing|shipping)\s+(a\s+)?(new\s+)?(app|tool|platform|product)/i,
  /download\s+(our|my|the)\s+(app|tool|extension|plugin)/i,
  /try\s+(it|our|my)\s+(tool|app|product|platform)\s+(today|now|for\s+free)/i,
];

const FIRST_PERSON_PROJECT_PITCH = [
  /why\s+i['']?m?\s+writing\s+this/i,
  /one\s+line\s+pitch/i,
  /hope\s+to\s+see\s+you\s+in\s+the\s+issues/i,
  /if\s+that\s+resonates/i,
  /thanks\s+for\s+reading/i,
  /let\s+me\s+know\s+what\s+you\s+think/i,
  /drop\s+a\s+(comment|like|star)/i,
  /share\s+(this\s+)?(post|article|guide)/i,
];

// ── Allowed source types for KB articles ───────────────────────────────────
export const ALLOWED_SOURCE_SITES = [
  'hackernews',
  'devto',
  'reddit',
  'codcompass', // internal
  'hand-written',
  'ai-generated',
  'rss-feed',
];

// ── Minimum content requirements ───────────────────────────────────────────
const MIN_CONTENT_LENGTH = 200; // characters
const MAX_EMOJI_RATIO = 0.05; // max 5% emoji characters

// ── HTML security red flags ───────────────────────────────────────────────
const HTML_SECURITY_PATTERNS = [
  { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, name: 'Script tags (XSS risk)' },
  { pattern: /javascript:/gi, name: 'javascript: protocol (XSS risk)' },
  { pattern: /on\w+\s*=/gi, name: 'Inline event handlers (XSS risk)' },
  { pattern: /<iframe[^>]*>/gi, name: 'Iframe injection' },
  { pattern: /<object[^>]*>/gi, name: 'Object injection' },
  { pattern: /<embed[^>]*>/gi, name: 'Embed injection' },
  { pattern: /<form[^>]*>/gi, name: 'Form injection (phishing risk)' },
];

// ── URL pattern detection ─────────────────────────────────────────────────
const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
const MAX_URL_COUNT = 50; // Max URLs allowed in content

/**
 * Detect if content looks like raw Markdown instead of HTML.
 */
function detectMarkdownLeakage(content: string): string[] {
  const issues: string[] = [];

  for (const { pattern, name } of MARKDOWN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Code blocks and lists are common — only flag if >3 occurrences
      if (name.includes('code block') || name.includes('list')) {
        if (matches.length > 3) {
          issues.push(`Found ${matches.length} instances of: ${name}`);
        }
      } else {
        issues.push(`Found ${matches.length} instances of: ${name}`);
      }
    }
  }

  return issues;
}

/**
 * Detect promotional / GitHub README-style content.
 */
function detectPromotionalContent(content: string): string[] {
  const issues: string[] = [];

  for (const pattern of PROMOTIONAL_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`Promotional content detected: "${pattern.source}"`);
      break;
    }
  }

  for (const pattern of FIRST_PERSON_PROJECT_PITCH) {
    if (pattern.test(content)) {
      issues.push(`First-person project pitch detected: "${pattern.source}"`);
      break;
    }
  }

  return issues;
}

/**
 * Validate content length and quality metrics.
 */
function validateContentQuality(content: string): string[] {
  const issues: string[] = [];
  const stripped = content.replace(/<[^>]*>/g, '').trim();

  if (stripped.length < MIN_CONTENT_LENGTH) {
    issues.push(`Content too short: ${stripped.length} chars (minimum ${MIN_CONTENT_LENGTH})`);
  }

  // Check emoji ratio
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}]/gu;
  const emojis = stripped.match(emojiRegex);
  if (emojis) {
    const ratio = emojis.length / stripped.length;
    if (ratio > MAX_EMOJI_RATIO) {
      issues.push(`Excessive emoji usage: ${(ratio * 100).toFixed(1)}% of content`);
    }
  }

  return issues;
}

/**
 * Clean common Markdown artifacts from content.
 * This is a fallback — ideally content should be validated and rejected,
 * but for existing dirty data we can attempt repair.
 */
export function cleanMarkdownArtifacts(content: string): string {
  let cleaned = content;

  // Remove GitHub-style heading anchors: [](#some-id)
  cleaned = cleaned.replace(/\s*\[.*?\]\(#.*?\)/g, '');

  // Convert * * * to <hr />
  cleaned = cleaned.replace(/\*\s*\*\s*\*/g, '<hr />');

  // Convert standalone --- to <hr />
  cleaned = cleaned.replace(/^---$/gm, '<hr />');

  // Remove emoji-only lines
  cleaned = cleaned.replace(/^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/gmu, '').trim();

  return cleaned;
}

/**
 * Detect HTML security risks (XSS, injection, etc.)
 */
function detectHtmlSecurityIssues(content: string): string[] {
  const issues: string[] = [];

  for (const { pattern, name } of HTML_SECURITY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      issues.push(`Security issue: ${name} (${matches.length} instances)`);
    }
  }

  return issues;
}

/**
 * Validate URL count and patterns in content.
 */
function validateUrls(content: string): string[] {
  const issues: string[] = [];
  const urls = content.match(URL_PATTERN) || [];

  if (urls.length > MAX_URL_COUNT) {
    issues.push(`Too many URLs: ${urls.length} (maximum ${MAX_URL_COUNT})`);
  }

  // Check for suspicious URL patterns
  const suspiciousUrls = urls.filter((url) =>
    url.includes('bit.ly') ||
    url.includes('tinyurl') ||
    url.includes('goo.gl') ||
    url.includes('t.co') ||
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)
  );

  if (suspiciousUrls.length > 3) {
    issues.push(`Suspicious URLs detected: ${suspiciousUrls.length} shortened/IP-based URLs`);
  }

  return issues;
}

/**
 * Clean HTML security issues from content.
 */
export function cleanHtmlSecurity(content: string): string {
  let cleaned = content;

  // Remove script tags and content
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove inline event handlers
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: protocol
  cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');

  // Remove iframes, objects, embeds
  cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed[^>]*\/?>/gi, '');

  // Remove forms
  cleaned = cleaned.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');

  return cleaned;
}

/**
 * Main validation function.
 *
 * @param content - The article content (should be HTML)
 * @param options - Optional validation settings
 * @returns ValidationResult with errors/warnings and optionally cleaned content
 */
export function validateArticleContent(
  content: string,
  options: {
    strict?: boolean;
    autoClean?: boolean;
    checkSource?: boolean;
    sourceSite?: string;
  } = {}
): ValidationResult {
  const { strict = false, autoClean = false, checkSource = false, sourceSite } = options;
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── 1. Markdown leakage check ──────────────────────────────────────────
  const mdIssues = detectMarkdownLeakage(content);
  if (mdIssues.length > 0) {
    if (strict) {
      errors.push(...mdIssues);
    } else {
      warnings.push(...mdIssues);
    }
  }

  // ── 2. Promotional content check ───────────────────────────────────────
  const promoIssues = detectPromotionalContent(content);
  if (promoIssues.length > 0) {
    errors.push(...promoIssues); // Always error — this is never acceptable
  }

  // ── 3. Content quality check ───────────────────────────────────────────
  const qualityIssues = validateContentQuality(content);
  if (qualityIssues.length > 0) {
    if (strict) {
      errors.push(...qualityIssues);
    } else {
      warnings.push(...qualityIssues);
    }
  }

  // ── 4. HTML security check ─────────────────────────────────────────────
  const securityIssues = detectHtmlSecurityIssues(content);
  if (securityIssues.length > 0) {
    errors.push(...securityIssues); // Always error — security issues must be fixed
  }

  // ── 5. URL validation ──────────────────────────────────────────────────
  const urlIssues = validateUrls(content);
  if (urlIssues.length > 0) {
    if (strict) {
      errors.push(...urlIssues);
    } else {
      warnings.push(...urlIssues);
    }
  }

  // ── 6. Source validation ───────────────────────────────────────────────
  if (checkSource && sourceSite && !ALLOWED_SOURCE_SITES.includes(sourceSite)) {
    warnings.push(`Unusual source site: "${sourceSite}". Expected one of: ${ALLOWED_SOURCE_SITES.join(', ')}`);
  }

  // ── 7. Auto-clean if requested ─────────────────────────────────────────
  let cleanedContent: string | undefined;
  if (autoClean && errors.length === 0) {
    let tempCleaned = content;

    // Clean Markdown artifacts
    if (mdIssues.length > 0) {
      tempCleaned = cleanMarkdownArtifacts(tempCleaned);
      warnings.push('Content was auto-cleaned (Markdown artifacts removed)');
    }

    // Clean HTML security issues
    if (securityIssues.length > 0) {
      // Don't auto-clean security issues — reject instead
    }

    cleanedContent = tempCleaned !== content ? tempCleaned : undefined;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedContent,
  };
}

/**
 * Validate article metadata (title, slug, etc.)
 */
export function validateArticleMetadata(data: {
  slug?: string;
  titleEn?: string;
  contentEn?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Slug validation
  if (!data.slug) {
    errors.push('Missing slug');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    errors.push(`Invalid slug format: "${data.slug}". Use lowercase alphanumeric with hyphens.`);
  }

  // Title validation
  if (!data.titleEn) {
    errors.push('Missing titleEn');
  } else if (data.titleEn.length < 5) {
    errors.push('Title too short (minimum 5 characters)');
  } else if (data.titleEn.length > 200) {
    errors.push('Title too long (maximum 200 characters)');
  }

  // Content validation
  if (!data.contentEn) {
    errors.push('Missing contentEn');
  } else {
    const contentResult = validateArticleContent(data.contentEn, { strict: true });
    if (!contentResult.valid) {
      errors.push(...contentResult.errors.map(e => `Content: ${e}`));
    }
    warnings.push(...contentResult.warnings.map(w => `Content: ${w}`));
  }

  return { valid: errors.length === 0, errors, warnings };
}
