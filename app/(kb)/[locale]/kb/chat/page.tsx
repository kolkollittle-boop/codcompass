'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SourceRef {
  slug: string;
  title: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-docs-accent border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setSources([]);

    // Add placeholder for streaming response
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      // Parse sources from header
      const sourcesHeader = response.headers.get('X-AI-Sources');
      if (sourcesHeader) {
        try {
          setSources(JSON.parse(sourcesHeader));
        } catch {
          // Ignore parse errors
        }
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      // Remove the empty assistant message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [input]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-docs-border bg-docs-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <p className="text-sm text-docs-muted">
              Ask questions about our 2,800+ knowledge base articles
            </p>
          </div>
          <Link
            href={('/kb') as any}
            className="inline-flex items-center gap-1 text-sm text-docs-secondary hover:text-docs-accent"
          >
            <Icon name="chevron-left" size={16} />
            Back to KB
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-docs-accent/10">
                <Icon name="sparkles" size={32} className="text-docs-accent" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">How can I help?</h2>
              <p className="text-docs-secondary">
                Ask me anything about software engineering, AI, DevOps, or web development.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['What is RAG architecture?', 'How to set up CI/CD with GitHub Actions?', 'React hooks best practices', 'Explain the SOLID principles'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-lg border border-docs-border bg-docs-surface px-4 py-2 text-sm text-docs-secondary transition-colors hover:border-docs-accent/50 hover:text-docs-heading"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-docs-accent/20">
                  <Icon name="sparkles" size={16} className="text-docs-accent" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-docs-accent text-docs-bg'
                    : 'bg-docs-surface text-docs-body',
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none prose-a:text-docs-accent">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-docs-accent text-docs-bg text-xs font-bold">
                  {session?.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1].content && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-docs-accent/20">
                <Icon name="sparkles" size={16} className="text-docs-accent" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-docs-surface px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-docs-accent" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-docs-accent" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-docs-accent" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {sources.length > 0 && (
            <div className="rounded-xl border border-docs-border bg-docs-surface p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-docs-muted">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <Link
                    key={i}
                    href={`/kb/${s.slug}` as any}
                    className="rounded-lg border border-docs-border/50 bg-docs-bg px-3 py-1 text-xs text-docs-secondary transition-colors hover:border-docs-accent/50 hover:text-docs-accent"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-docs-border bg-docs-bg px-6 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-end rounded-xl border border-docs-border bg-docs-surface p-2 focus-within:border-docs-accent/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="min-h-[44px] w-full resize-none bg-transparent px-3 py-2 text-sm text-docs-body placeholder:text-docs-muted focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                isLoading || !input.trim()
                  ? 'text-docs-muted'
                  : 'bg-docs-accent text-docs-bg hover:bg-docs-accent-hover',
              )}
            >
              <Icon name="send" size={18} />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-docs-muted">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
