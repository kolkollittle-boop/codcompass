'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, Save, Eye, Edit3, Sparkles, Image, CheckSquare, Square, Layers, ArrowLeft, Play, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Article = {
  id: string;
  titleEn: string;
  contentEn: string;
  qualityScore: number;
  status: string;
  isPremium: boolean;
  createdAt?: string;
  crawledAt?: string;
  qualityDetails?: any;
};

export default function AdminReviewDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [editorContent, setEditorContent] = useState('');
  
  // 多选状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  
  // 爬虫状态
  const [crawlerRunning, setCrawlerRunning] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles');
      const json = await res.json();
      if (json.success && json.data) {
        setArticles(json.data);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleSelect = (art: Article) => {
    setSelected(art);
    setEditorContent(art.contentEn);
  };

  // 切换单个文章的选择状态
  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));
    }
  };

  // 触发爬虫
  const triggerCrawler = async () => {
    setCrawlerRunning(true);
    try {
      const res = await fetch('/api/admin/crawler', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('爬虫已触发！请在 GitHub Actions 中查看进度。');
      } else {
        alert(`触发失败: ${json.error}`);
      }
    } catch (e: any) {
      alert(`触发失败: ${e.message}`);
    } finally {
      setCrawlerRunning(false);
    }
  };

  // 批量操作
  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) {
      alert('请先选择要操作的文章');
      return;
    }
    
    if (!confirm(`确定要${action === 'approve' ? '发布' : '拒绝'} ${selectedIds.size} 篇文章吗？`)) {
      return;
    }
    
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        
        const json = await res.json();
        if (json.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }
    
    setBatchProcessing(false);
    setSelectedIds(new Set());
    
    // 刷新文章列表
    setArticles(prev => prev.filter(a => !selectedIds.has(a.id)));
    
    if (selected && selectedIds.has(selected.id)) {
      setSelected(null);
    }
    
    alert(`批量操作完成：成功 ${successCount} 篇，失败 ${failCount} 篇`);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'save') => {
    if (!selected) return;
    
    const qd = selected.qualityDetails || {};
    const difficultyLevel = qd.difficulty_level || 'L2';
    const monetization = selected.isPremium ? 'premium' : 'free';
    
    try {
      const res = await fetch(`/api/admin/articles/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          difficultyLevel,
          monetization,
          contentEn: mode === 'edit' ? editorContent : undefined,
        }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        alert(`操作成功: ${action}`);
        // 从列表中移除已处理的文章
        setArticles(prev => prev.filter(a => a.id !== selected.id));
        setSelected(null);
      } else {
        alert(`操作失败: ${json.error}`);
      }
    } catch (e: any) {
      alert(`请求失败: ${e.message}`);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-12 border-b border-zinc-800 flex items-center px-6 bg-zinc-900/50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-zinc-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono font-bold text-cyan-400 tracking-wider">⚡ ADMIN REVIEW TERMINAL</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={triggerCrawler} 
            disabled={crawlerRunning}
            className="bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs"
          >
            {crawlerRunning ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            {crawlerRunning ? '运行中...' : '触发爬虫'}
          </Button>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">已选 {selectedIds.size} 篇</span>
            <Button 
              size="sm" 
              onClick={() => handleBatchAction('approve')} 
              disabled={batchProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
            >
              <Check className="w-3 h-3 mr-1" /> 批量发布
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleBatchAction('reject')} 
              disabled={batchProcessing}
              variant="destructive"
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" /> 批量拒绝
            </Button>
          </div>
        )}
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="h-full overflow-y-auto p-4 space-y-2 border-r border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending Queue ({articles.length})</h2>
              <button 
                onClick={toggleSelectAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {selectedIds.size === articles.length ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                {selectedIds.size === articles.length ? '取消全选' : '全选'}
              </button>
            </div>
            {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-zinc-600" /> :
              articles.map(art => {
                const qd = art.qualityDetails || {};
                const score = art.qualityScore || 0;
                const difficulty = qd.difficulty_level || 'L2';
                const date = art.createdAt || art.crawledAt;
                const timeStr = date ? new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
                const isSelected = selectedIds.has(art.id);
                return (
                  <div key={art.id} className={`w-full text-left p-3 rounded-md border transition-all ${selected?.id === art.id ? 'bg-cyan-950/40 border-cyan-700' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
                    <div className="flex items-start gap-2">
                      <button 
                        onClick={() => toggleSelectId(art.id)}
                        className="mt-0.5 text-zinc-500 hover:text-cyan-400 flex-shrink-0"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleSelect(art)} className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm truncate max-w-[110px]">{art.titleEn}</span>
                          <Badge variant={score > 80 ? 'default' : 'secondary'} className="text-[10px]">{score}</Badge>
                        </div>
                        <div className="flex gap-2 text-[10px] text-zinc-500">
                          <span>{difficulty}</span> • <span>{art.isPremium ? '💎 Pro' : 'Free'}</span>
                        </div>
                        {timeStr && <div className="text-[10px] text-zinc-600 mt-1">{timeStr}</div>}
                      </button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-800" />

        <ResizablePanel defaultSize={55}>
          <div className="h-full flex flex-col">
            {selected ? (
              <>
                <div className="p-4 border-b border-zinc-800 bg-cyan-950/20">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
                    <Sparkles className="w-3 h-3" /> AI Mentor Insight
                  </div>
                  <p className="text-sm text-zinc-200 leading-snug font-medium">{selected.qualityDetails?.mentor_summary || "No summary available."}</p>
                </div>
                <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                  <h3 className="font-semibold text-zinc-100">{selected.titleEn}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant={mode === 'preview' ? 'default' : 'ghost'} onClick={() => setMode('preview')}><Eye className="w-3 h-3 mr-1" /> 预览</Button>
                    <Button size="sm" variant={mode === 'edit' ? 'default' : 'ghost'} onClick={() => setMode('edit')}><Edit3 className="w-3 h-3 mr-1" /> 编辑</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {mode === 'edit' ? (
                    <Textarea className="h-full font-mono text-sm bg-zinc-900/80 border-zinc-700 text-zinc-300 focus:border-cyan-500" value={editorContent} onChange={e => setEditorContent(e.target.value)} />
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{editorContent}</ReactMarkdown></div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">Select an article</div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-800" />

        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-5 space-y-6 border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
            {selected ? (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">⚙️ Publishing Config</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Difficulty Level</Label>
                    <Select defaultValue={selected.qualityDetails?.difficulty_level || 'L2'}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white text-zinc-900 border-zinc-200">
                        <SelectItem value="L1" className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">L1 - Beginner</SelectItem>
                        <SelectItem value="L2" className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">L2 - Intermediate</SelectItem>
                        <SelectItem value="L3" className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">L3 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Monetization</Label>
                    <Select defaultValue={selected.isPremium ? 'premium' : 'free'}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white text-zinc-900 border-zinc-200">
                        <SelectItem value="free" className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">Free Access</SelectItem>
                        <SelectItem value="premium" className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900">💎 Member Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selected.qualityDetails?.chinese_preview && (
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400">中文预览</Label>
                      <div className="text-xs text-zinc-300 bg-zinc-900 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {selected.qualityDetails.chinese_preview}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Knowledge Graph (Related IDs)</Label>
                    <Input className="bg-zinc-900 border-zinc-700 text-zinc-200 h-8 text-xs font-mono" placeholder="e.g. 102, 45, 89" />
                  </div>
                </div>
                <div className="h-px bg-zinc-800 my-4" />
                <div className="space-y-3">
                  <Button onClick={() => handleAction('save')} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-9"><Save className="w-3 h-3 mr-2" /> 保存草稿</Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"><Check className="w-3 h-3 mr-1" /> 发布</Button>
                    <Button onClick={() => handleAction('reject')} variant="destructive" className="bg-red-600/80 h-9"><X className="w-3 h-3 mr-1" /> 拒绝</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                <div className="text-center">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                  <p>选择文章进行审核</p>
                  <p className="text-xs mt-1">勾选左侧复选框可批量操作</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
