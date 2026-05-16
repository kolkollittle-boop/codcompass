import sanitizeHtml from 'sanitize-html';

export function sanitizeBlogHtml(html: string): string {
  // Strip Dev.to embed artifacts
  let cleaned = html
    .replace(/Enter fullscreen mode\s*Exit fullscreen mode/gi, '')
    .replace(/Copy code\s*Add a header/gi, '')
    .replace(/Copy code/gi, '')
    .replace(/Add a header/gi, '');

  return sanitizeHtml(cleaned, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2', 'h3', 'h4', 'pre', 'code', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      pre: ['class'],
      table: ['class'],
      th: ['class', 'scope'],
      td: ['class'],
      thead: ['class'],
      tbody: ['class'],
      tr: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
