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
import { Loader2, Check, X, Save, Eye, Edit3, Sparkles, Image, CheckSquare, Square, Layers, ArrowLeft, Play, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Article = {
  id: string;
  titleEn: string;
  contentEn: string;
  qualityScore: number;
  status: string;
  isPremium: boolean;
  accessLevel?: string;
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
  
  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  
  // Crawler trigger state
  const [crawlerRunning, setCrawlerRunning] = useState(false);
  
  // Sort order
  const [sortOrder, setSortOrder] = useState<'default' | 'score-asc' | 'score-desc'>('default');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Articles pending review only
      const res = await fetch('/api/admin/articles?status=REVIEW');
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

  // Sorted article list
  const getSortedArticles = () => {
    if (sortOrder === 'default') return articles;
    
    const sorted = [...articles].sort((a, b) => {
      const scoreA = a.qualityScore || 0;
      const scoreB = b.qualityScore || 0;
      return sortOrder === 'score-desc' ? scoreB - scoreA : scoreA - scoreB;
    });
    return sorted;
  };

  // Cycle sort order
  const toggleSortOrder = () => {
    if (sortOrder === 'default') setSortOrder('score-desc');
    else if (sortOrder === 'score-desc') setSortOrder('score-asc');
    else setSortOrder('default');
  };

  const getSortIcon = () => {
    if (sortOrder === 'default') return <ArrowUpDown className="w-3 h-3" />;
    if (sortOrder === 'score-desc') return <ArrowDown className="w-3 h-3" />;
    return <ArrowUp className="w-3 h-3" />;
  };

  const getSortLabel = () => {
    if (sortOrder === 'default') return 'Default order';
    if (sortOrder === 'score-desc') return 'Score ↓';
    return 'Score ↑';
  };

  const handleSelect = (art: Article) => {
    setSelected(art);
    setEditorContent(art.contentEn);
  };

  // Toggle one article selected
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

  // Select all / clear
  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));
    }
  };

  // Trigger crawler
  const triggerCrawler = async () => {
    setCrawlerRunning(true);
    try {
      const res = await fetch('/api/admin/crawler', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        const lines = [
          json.message || 'Dispatched',
          json.jobId ? `jobId: ${json.jobId}` : '',
          json.actionsUrl ? `Actions: ${json.actionsUrl}` : '',
          json.errorMessage ? `Note: ${json.errorMessage}` : '',
        ].filter(Boolean);
        alert(lines.join('\n'));
      } else {
        alert(`Trigger failed: ${json.error || res.statusText}`);
      }
    } catch (e: unknown) {
      alert(`Trigger failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setCrawlerRunning(false);
    }
  };

  // Batch approve/reject
  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) {
      alert('Select at least one article first');
      return;
    }
    
    if (!confirm(`${action === 'approve' ? 'Publish' : 'Reject'} ${selectedIds.size} article(s)?`)) {
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
    
    // Refresh list
    setArticles(prev => prev.filter(a => !selectedIds.has(a.id)));
    
    if (selected && selectedIds.has(selected.id)) {
      setSelected(null);
    }
    
    alert(`Batch done: ${successCount} succeeded, ${failCount} failed`);
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
        alert(`Success: ${action}`);
        // Remove processed article from list
        setArticles(prev => prev.filter(a => a.id !== selected.id));
        setSelected(null);
      } else {
        alert(`Action failed: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Request failed: ${e.message}`);
    }
  };

  return (
    <div className="h-screen bg-palette-bgPrimary text-palette-textPrimary flex flex-col">
      <header className="h-12 border-b border-palette-border flex items-center px-6 bg-palette-bgSecondary justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-palette-textMuted hover:text-palette-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono font-bold text-palette-accent tracking-wider">⚡ ADMIN REVIEW TERMINAL</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={triggerCrawler} 
            disabled={crawlerRunning}
            className="bg-palette-primary hover:bg-palette-primary-hover text-white h-7 text-xs"
          >
            {crawlerRunning ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            {crawlerRunning ? 'Running...' : 'Run crawler'}
          </Button>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-palette-textMuted">{selectedIds.size} selected</span>
            <Button 
              size="sm" 
              onClick={() => handleBatchAction('approve')} 
              disabled={batchProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
            >
              <Check className="w-3 h-3 mr-1" /> Approve all
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleBatchAction('reject')} 
              disabled={batchProcessing}
              variant="destructive"
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Reject all
            </Button>
          </div>
        )}
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="h-full overflow-y-auto p-4 space-y-2 border-r border-palette-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-palette-textMuted uppercase tracking-wider">Pending Queue ({articles.length})</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSortOrder}
                  className="text-xs text-palette-textMuted hover:text-palette-accent flex items-center gap-1 px-2 py-1 rounded bg-palette-bgSecondary hover:bg-palette-bgSecondary transition-colors"
                  title="Toggle score sort"
                >
                  {getSortIcon()}
                  <span className="hidden sm:inline">{getSortLabel()}</span>
                </button>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-palette-accent hover:text-palette-accent flex items-center gap-1"
                >
                  {selectedIds.size === articles.length ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                  {selectedIds.size === articles.length ? 'Clear all' : 'Select all'}
                </button>
              </div>
            </div>
            {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-palette-textMuted" /> :
              getSortedArticles().map(art => {
                const qd = art.qualityDetails || {};
                const score = art.qualityScore || 0;
                const difficulty = qd.difficulty_level || 'L2';
                const publishedAt = art.createdAt;
                const crawledAt = art.crawledAt;
                const publishedStr = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '';
                const crawledStr = crawledAt ? new Date(crawledAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
                const isSelected = selectedIds.has(art.id);
                return (
                  <div
                    key={art.id}
                    className={`w-full text-left p-3 rounded-md border transition-all cursor-pointer ${selected?.id === art.id ? 'bg-palette-bgSecondary ring-1 ring-palette-primary border-palette-primary' : 'bg-palette-bgSecondary border-palette-border hover:bg-palette-bgSecondary'} ${isSelected ? 'border-palette-primary bg-palette-bgTertiary ring-1 ring-palette-primary ring-1 ring-palette-primary' : ''}`}
                    onClick={() => {
                      // Card click: toggle selection + open article
                      toggleSelectId(art.id);
                      handleSelect(art);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectId(art.id);
                        }}
                        className="mt-0.5 p-1.5 -m-1.5 text-palette-textMuted hover:text-palette-accent flex-shrink-0 rounded transition-colors"
                        title={isSelected ? 'Deselect' : 'Select article'}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-palette-accent" /> : <Square className="w-5 h-5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm truncate max-w-[110px]">{art.titleEn}</span>
                          <Badge variant={score > 80 ? 'default' : 'secondary'} className="text-[10px]">{score}</Badge>
                        </div>
                        <div className="flex gap-2 text-[10px] text-palette-textMuted">
                          <span>{difficulty}</span> • <span>{
                            art.accessLevel === 'pro' ? '💎 Pro' :
                            art.accessLevel === 'builder' ? '🔧 Builder' : 'Free'
                          }</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-palette-textMuted mt-1">
                          {publishedStr && <span>📅 {publishedStr}</span>}
                          {crawledStr && <span>🕸️ {crawledStr}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-palette-bgSecondary" />

        <ResizablePanel defaultSize={55}>
          <div className="h-full flex flex-col">
            {selected ? (
              <>
                <div className="p-4 border-b border-palette-border bg-palette-bgSecondary">
                  <div className="flex items-center gap-2 text-palette-accent text-xs font-bold uppercase tracking-widest mb-1">
                    <Sparkles className="w-3 h-3" /> AI Mentor Insight
                  </div>
                  <p className="text-sm text-palette-textSecondary leading-snug font-medium">{selected.qualityDetails?.mentor_summary || "No summary available."}</p>
                </div>
                <div className="flex justify-between items-center px-4 py-2 border-b border-palette-border bg-palette-bgTertiary">
                  <h3 className="font-semibold text-palette-textPrimary">{selected.titleEn}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant={mode === 'preview' ? 'default' : 'ghost'} onClick={() => setMode('preview')}><Eye className="w-3 h-3 mr-1" /> Preview</Button>
                    <Button size="sm" variant={mode === 'edit' ? 'default' : 'ghost'} onClick={() => setMode('edit')}><Edit3 className="w-3 h-3 mr-1" /> Edit</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {mode === 'edit' ? (
                    <Textarea className="h-full font-mono text-sm bg-palette-bgSecondary border-palette-border text-palette-textSecondary focus:border-palette-primary" value={editorContent} onChange={e => setEditorContent(e.target.value)} />
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{editorContent}</ReactMarkdown></div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-palette-textMuted">Select an article</div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-palette-bgSecondary" />

        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-5 space-y-6 border-l border-palette-border bg-palette-bgPrimary overflow-y-auto">
            {selected ? (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-palette-textMuted uppercase tracking-widest">⚙️ Publishing Config</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-palette-textMuted">Difficulty Level</Label>
                    <Select defaultValue={selected.qualityDetails?.difficulty_level || 'L2'}>
                      <SelectTrigger className="bg-palette-bgCard border-palette-border text-palette-textSecondary h-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-palette-bgCard text-palette-textPrimary border-palette-border">
                        <SelectItem value="L1" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">L1 - Beginner</SelectItem>
                        <SelectItem value="L2" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">L2 - Intermediate</SelectItem>
                        <SelectItem value="L3" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">L3 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-palette-textMuted">Access Level</Label>
                    <Select defaultValue={
                      selected.accessLevel === 'pro' ? 'pro' :
                      selected.accessLevel === 'builder' ? 'builder' : 'free'
                    }>
                      <SelectTrigger className="bg-palette-bgCard border-palette-border text-palette-textSecondary h-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-palette-bgCard text-palette-textPrimary border-palette-border">
                        <SelectItem value="free" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">Free Access</SelectItem>
                        <SelectItem value="builder" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">🔧 Builder Level</SelectItem>
                        <SelectItem value="pro" className="text-palette-textPrimary focus:bg-palette-bgSecondary focus:text-palette-textPrimary">💎 Pro Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selected.qualityDetails?.chinese_preview && (
                    <div className="space-y-2">
                      <Label className="text-xs text-palette-textMuted">Chinese preview</Label>
                      <div className="text-xs text-palette-textSecondary bg-palette-bgCard p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {selected.qualityDetails.chinese_preview}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-palette-textMuted">Knowledge Graph (Related IDs)</Label>
                    <Input className="bg-palette-bgCard border-palette-border text-palette-textSecondary h-8 text-xs font-mono" placeholder="e.g. 102, 45, 89" />
                  </div>
                </div>
                <div className="h-px bg-palette-bgSecondary my-4" />
                <div className="space-y-3">
                  <Button onClick={() => handleAction('save')} className="w-full bg-palette-bgSecondary hover:bg-palette-bgTertiary text-palette-textSecondary h-9"><Save className="w-3 h-3 mr-2" /> Save draft</Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"><Check className="w-3 h-3 mr-1" /> Publish</Button>
                    <Button onClick={() => handleAction('reject')} variant="destructive" className="bg-red-600/80 h-9"><X className="w-3 h-3 mr-1" /> Reject</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-palette-textMuted text-sm">
                <div className="text-center">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-palette-textMuted" />
                  <p>Select an article to review</p>
                  <p className="text-xs mt-1">Use checkboxes on the left for batch actions</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
