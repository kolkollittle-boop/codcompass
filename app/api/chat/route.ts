import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TOP_K = 5;
const MAX_CONTEXT_ARTICLES = 3;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Search articles using PostgreSQL full-text search. */
async function searchArticles(query: string) {
  // Sanitize query for full-text search
  const sanitized = query
    .replace(/[&|!()<>]/g, ' ')
    .trim();

  if (!sanitized) return [];

  const { data, error } = await supabase.rpc('search_articles_fts', {
    search_query: sanitized,
    result_limit: TOP_K,
  });

  if (error) {
    console.error('[Chat RAG] Search error:', error);
    return [];
  }

  return data || [];
}

/** Fetch full content of articles by IDs. */
async function fetchArticleContents(articleIds: string[]) {
  if (articleIds.length === 0) return [];

  const { data, error } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn')
    .in('id', articleIds);

  if (error) {
    console.error('[Chat RAG] Fetch error:', error);
    return [];
  }
  return data || [];
}

/** Build the RAG prompt with article context. */
function buildRagPrompt(
  userMessage: string,
  articles: { slug: string; title: string; content: string }[],
  conversationHistory: ChatMessage[],
): { systemPrompt: string; messages: ChatMessage[] } {
  const contextParts: string[] = [];
  for (let i = 0; i < Math.min(articles.length, MAX_CONTEXT_ARTICLES); i++) {
    const article = articles[i];
    const content = article.content.length > 3000
      ? article.content.slice(0, 3000) + '...'
      : article.content;
    contextParts.push(
      `### Article ${i + 1}: ${article.title}\nSlug: ${article.slug}\n${content}`
    );
  }

  const context = contextParts.join('\n\n---\n\n');

  const systemPrompt = `You are a helpful AI assistant for Codcompass — a developer knowledge base with 2,800+ articles on software engineering, AI, DevOps, and web development.

Answer the user's question based on the provided article context. Be specific and practical.

Rules:
- Base your answer primarily on the provided articles. If the articles don't fully answer the question, acknowledge that and give your best technical answer.
- When referencing information from an article, mention the article title naturally.
- Use code blocks for code examples.
- Keep responses concise — developers want the answer, not essays.
- If you're unsure, say so. Don't invent APIs, endpoints, or features.
- Respond in the same language the user writes in.

${context ? `## Reference Articles:\n\n${context}` : ''}`;

  const recentHistory = conversationHistory.slice(-6);

  return { systemPrompt, messages: recentHistory };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { message, history }: { message: string; history: ChatMessage[] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  }

  // Check free user limits
  const userPlan = (session.user as any)?.plan || 'FREE';
  if (userPlan === 'FREE') {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('ChatSession')
      .select('id', { count: 'exact', head: true })
      .eq('userId', session.user.id)
      .gte('createdAt', `${today}T00:00:00Z`);

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Free limit reached. Upgrade for unlimited conversations.' },
        { status: 429 }
      );
    }
  }

  // Step 1: Search for relevant articles
  const searchResults = await searchArticles(message);
  const articleIds = searchResults.slice(0, MAX_CONTEXT_ARTICLES).map((r: any) => r.id);
  const articles = await fetchArticleContents(articleIds);

  // Step 2: Build RAG prompt
  const { systemPrompt, messages } = buildRagPrompt(
    message,
    articles.map(a => ({ slug: a.slug, title: a.titleEn, content: a.contentEn })),
    history || [],
  );

  // Step 3: Stream AI response
  const apiKey = process.env.OPENROUTER_API_KEY;
  const aiResponse = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: message },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!aiResponse.ok) {
    const errorBody = await aiResponse.text().catch(() => '');
    return NextResponse.json(
      { error: `AI API error: ${aiResponse.status} ${errorBody.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const reader = aiResponse.body?.getReader();
  if (!reader) {
    return NextResponse.json({ error: 'No response body' }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullContent = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err) {
        console.error('[Chat RAG] Stream error:', err);
      } finally {
        controller.close();

        // Save the conversation
        try {
          await supabase.from('ChatSession').insert({
            userId: session.user!.id,
            messages: [...(history || []), { role: 'user', content: message }, { role: 'assistant', content: fullContent }],
            sources: articles.map(a => ({ slug: a.slug, title: a.titleEn })),
          });
        } catch {
          // Don't fail if saving fails
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-AI-Sources': JSON.stringify(articles.map(a => ({ slug: a.slug, title: a.titleEn }))),
    },
  });
}
