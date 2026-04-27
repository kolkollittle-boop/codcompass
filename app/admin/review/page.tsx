'use client';

import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X, Save, Eye, Edit3, Sparkles, Image, Link2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Article = {
  id: string;
  titleEn: string;
  contentEn: string;
  ai_score: number;
  difficulty_level: string;
  status: string;
  mentor_summary?: string;
  category?: string;
  monetization?: string;
};

export default function AdminReviewDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [editorContent, setEditorContent] = useState('');
  const [viewMode, setViewMode] = useState<'original' | 'hanzi'>('original');

  // 1. 获取数据 (SOP: status='scored')
  const fetchArticles = async () => {
    try {
      // TODO: Replace with real fetch: /api/articles?status=scored
      setTimeout(() => {
        setArticles([
          { id: '1', titleEn: 'Mastering Rust Async', contentEn: '## Introduction...', ai_score: 88, difficulty_level: 'L2', status: 'scored', mentor_summary: '核心在于理解 Tokio 运行时调度。适合想深入异步底层的开发者。', category: 'rust', monetization: 'premium' },
          { id: '2', titleEn: 'Next.js App Router vs Pages', contentEn: '...', ai_score: 75, difficulty_level: 'L1', status: 'scored', mentor_summary: '基础迁移指南。适合初学者快速上手。', category: 'nextjs', monetization: 'free' },
        ]);
        setLoading(false);
      }, 500);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleSelect = (art: Article) => {
    setSelected(art);
    setEditorContent(art.contentEn);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'save') => {
    if (!selected) return;
    console.log(`Action: ${action}`, selected.id);
    // TODO: Fetch PATCH /api/articles/[id]
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-12 border-b border-zinc-800 flex items-center px-6 bg-zinc-900/50">
        <span className="font-mono font-bold text-cyan-400">⚡ ADMIN TERMINAL</span>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* 🟦 左栏：待审队列 */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="h-full overflow-y-auto p-4 space-y-2 border-r border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Scored Queue ({articles.length})</h2>
            {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-zinc-600" /> :
              articles.map(art => (
                <button
                  key={art.id}
                  onClick={() => handleSelect(art)}
                  className={`w-full text-left p-3 rounded border transition-all ${selected?.id === art.id ? 'bg-cyan-950/30 border-cyan-700' : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate max-w-[130px]">{art.titleEn}</span>
                    <Badge variant={art.ai_score > 80 ? 'default' : 'secondary'} className="text-[10px]">{art.ai_score}</Badge>
                  </div>
                  <div className="flex gap-2 text-[10px] text-zinc-500">
                    <span>{art.difficulty_level}</span> • <span>{art.monetization === 'premium' ? '💎 Pro' : 'Free'}</span>
                  </div>
                </button>
              ))
            }
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-800" />

        {/* 🟨 中栏：编辑/预览区 */}
        <ResizablePanel defaultSize={55}>
          <div className="h-full flex flex-col">
            {selected ? (
              <>
                {/* 🧠 AI 极客导师摘要卡片 */}
                <div className="p-4 border-b border-zinc-800 bg-cyan-950/20">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
                    <Sparkles className="w-3 h-3" /> AI Mentor Insight
                  </div>
                  <p className="text-sm text-zinc-200 leading-snug font-medium">
                    {selected.mentor_summary || "No summary available."}
                  </p>
                </div>

                <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                  <h3 className="font-semibold text-zinc-100">{selected.titleEn}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 text-zinc-400">
                      <Image className="w-3 h-3 mr-1" /> 汉化视图
                    </Button>
                    <Button size="sm" variant={mode === 'preview' ? 'default' : 'ghost'} onClick={() => setMode('preview')}>
                      <Eye className="w-3 h-3 mr-1" /> 预览
                    </Button>
                    <Button size="sm" variant={mode === 'edit' ? 'default' : 'ghost'} onClick={() => setMode('edit')}>
                      <Edit3 className="w-3 h-3 mr-1" /> 编辑
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {mode === 'edit' ? (
                    <Textarea 
                      className="h-full font-mono text-sm bg-zinc-900/80 border-zinc-700 text-zinc-300 focus:border-cyan-500"
                      value={editorContent}
                      onChange={e => setEditorContent(e.target.value)}
                    />
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{editorContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">Select an article</div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-800" />

        {/* 🟥 右栏：决策中心 */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-5 space-y-6 border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
            {selected ? (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">⚙️ Publishing Config</h4>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Difficulty Level</Label>
                    <Select defaultValue={selected.difficulty_level}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L1">L1 - Beginner</SelectItem>
                        <SelectItem value="L2">L2 - Intermediate</SelectItem>
                        <SelectItem value="L3">L3 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Monetization</Label>
                    <Select defaultValue={selected.monetization}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Access</SelectItem>
                        <SelectItem value="premium">💎 Member Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Knowledge Graph (Related IDs)</Label>
                    <Input className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8 text-xs font-mono" placeholder="Comma separated IDs..." />
                  </div>
                </div>

                <div className="h-px bg-zinc-800 my-4" />

                <div className="space-y-3">
                  <Button onClick={() => handleAction('save')} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-9">
                    <Save className="w-3 h-3 mr-2" /> 保存草稿
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                      <Check className="w-3 h-3 mr-1" /> 发布
                    </Button>
                    <Button onClick={() => handleAction('reject')} variant="destructive" className="bg-red-600/80 h-9">
                      <X className="w-3 h-3 mr-1" /> 拒绝
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm">No selection</div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}