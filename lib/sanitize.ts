/**
 * HTML Sanitization Utility
 * 
 * Uses sanitize-html to prevent XSS attacks when rendering
 * user-generated or third-party HTML content.
 */

import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'a',
  'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'details', 'summary',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class', 'id',
  'src', 'alt', 'width', 'height',
  'lang', 'title',
];

const ALLOWED_PROTOCOLS = ['http', 'https', 'mailto'];

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitize(html: string): string {
  if (!html) return '';
  
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...ALLOWED_ATTR.reduce((acc, attr) => {
        acc['*'] = acc['*'] || [];
        acc['*'].push(attr);
        return acc;
      }, {} as Record<string, string[]>),
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'width', 'height', 'class'],
      code: ['class'],
      pre: ['class'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
    },
    allowedSchemes: ALLOWED_PROTOCOLS,
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowProtocolRelative: false,
    selfClosing: ['img', 'br', 'hr'],
    // Strip comments to prevent IE conditional comment attacks
    stripCommentTag: true,
    // Enforce lowercase tag names
    parseSchema: {
      lowercase: true,
    },
  });
}

/**
 * Sanitize and return as object for dangerouslySetInnerHTML
 */
export function sanitizeForRender(html: string): { __html: string } {
  return { __html: sanitize(html) };
}
