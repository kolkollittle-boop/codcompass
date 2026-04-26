import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple RAG implementation (no AI API needed for MVP)
async function searchRelevantContent(query: string): Promise<string> {
  // Simple keyword search (will be replaced with vector search)
  const { data: articles } = await supabase
    .from('Article')
    .select('titleEn, contentEn, excerptEn')
    .or(`titleEn.ilike.%${query}%,excerptEn.ilike.%${query}%`)
    .eq('isPublished', true)
    .limit(5);

  if (!articles || articles.length === 0) {
    return 'No relevant articles found in the knowledge base.';
  }

  return articles
    .map(a => `## ${a.titleEn}\n${a.excerptEn || a.contentEn?.slice(0, 500) || ''}`)
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Search for relevant content
    const relevantContent = await searchRelevantContent(message);

    // Simple response generation (will be replaced with AI API)
    const response = generateResponse(message, relevantContent, history);

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

function generateResponse(message: string, context: string, history: any[]): string {
  // Simple keyword-based response (MVP)
  // Will be replaced with AI API integration
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('react')) {
    return `Based on our knowledge base, here's what I found about React:\n\n${context}\n\nWould you like me to search for something more specific?`;
  }
  
  if (lowerMessage.includes('typescript')) {
    return `Based on our knowledge base, here's what I found about TypeScript:\n\n${context}\n\nWould you like me to search for something more specific?`;
  }
  
  if (lowerMessage.includes('next.js') || lowerMessage.includes('nextjs')) {
    return `Based on our knowledge base, here's what I found about Next.js:\n\n${context}\n\nWould you like me to search for something more specific?`;
  }
  
  return `I found some relevant content in our knowledge base:\n\n${context}\n\nCan you be more specific about what you're looking for?`;
}
