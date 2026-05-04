/**
 * 方案 5.1：KB 入库时的 TechArticle JSON-LD（精简字段，供前端或后续渲染注入）。
 */
export function buildTechArticleGeoJsonLd(input: {
  title: string;
  description: string;
  proficiencyLevel?: string;
  isBasedOnUrl?: string;
  keywords?: string[];
}): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description.slice(0, 500),
  };
  if (input.proficiencyLevel) {
    doc.proficiencyLevel = input.proficiencyLevel;
  }
  if (input.isBasedOnUrl) {
    doc.isBasedOn = input.isBasedOnUrl;
  }
  if (input.keywords?.length) {
    doc.keywords = input.keywords.join(', ');
  }
  return doc;
}

export function buildFaqPageGeoJsonLd(
  items: Array<{ question: string; answer: string }>
): Record<string, unknown> | null {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
