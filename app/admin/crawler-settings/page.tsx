'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, RefreshCw, Save, Plus, Trash2, Clock, Globe, Languages, X } from 'lucide-react';

type CrawlerConfig = {
  schedule: string;
  enabled: boolean;
  sources: SourceConfig[];
  translateContent: boolean;
  translateTargetLanguages: string[];
};

type SourceConfig = {
  id: string;
  url: string;
  type: 'devto' | 'hackernews' | 'reddit' | 'github' | 'rss' | 'custom';
  tags: string[];
  keywords: string[];
  enabled: boolean;
};

const defaultConfig: CrawlerConfig = {
  schedule: '0 * * * *',
  enabled: true,
  sources: [
    {
      id: '1',
      url: 'https://dev.to',
      type: 'devto',
      tags: ['javascript', 'typescript', 'react'],
      keywords: ['React', 'Next.js', 'TypeScript'],
      enabled: true,
    },
  ],
  translateContent: true,
  translateTargetLanguages: ['zh'],
};

const scheduleOptions = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 0 * * *', label: 'Daily' },
  { value: '0 0 */2 * *', label: 'Every 2 days' },
  { value: '0 0 * * 0', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const sourceTypeOptions = [
  { value: 'devto', label: 'Dev.to' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'github', label: 'GitHub' },
  { value: 'rss', label: 'RSS Feed' },
  { value: 'custom', label: 'Custom site' },
];

export default function CrawlerSettingsPage() {
  const [config, setConfig] = useState<CrawlerConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [crawlerLog, setCrawlerLog] = useState('');
  const [customSchedule, setCustomSchedule] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/crawler-config');
      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        if (json.data.schedule && !scheduleOptions.find(o => o.value === json.data.schedule)) {
          setCustomSchedule(json.data.schedule);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const scheduleToSave = config.schedule === 'custom' ? customSchedule : config.schedule;
      const res = await fetch('/api/admin/crawler-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, schedule: scheduleToSave }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Settings saved');
      } else {
        alert(`Save failed: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** Run now: enqueue + trigger GitHub Actions (returns in seconds; does not wait for crawl) */
  const triggerCrawler = async () => {
    setTriggering(true);
    setCrawlerLog('');
    setShowLogModal(true);

    try {
      const res = await fetch('/api/admin/crawler', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setCrawlerLog(`❌ HTTP ${res.status}\n${json.message || json.error || res.statusText}`);
        return;
      }
      if (!json.success) {
        setCrawlerLog(`❌ ${json.message || json.error || 'Dispatch failed'}`);
        return;
      }
      let text = `${json.message || 'OK'}\n\njobId: ${json.jobId}\nstatus: ${json.status}`;
      if (json.githubAccepted != null) text += `\ngithubAccepted: ${json.githubAccepted}`;
      if (json.actionsUrl) text += `\n\nActions (logs & progress):\n${json.actionsUrl}`;
      if (json.errorMessage) text += `\n\ndispatchError: ${json.errorMessage}`;
      setCrawlerLog(text);

      if (json.jobId) {
        await new Promise((r) => setTimeout(r, 600));
        try {
          const jr = await fetch(`/api/admin/crawler?jobId=${encodeURIComponent(json.jobId)}`);
          const jd = await jr.json();
          if (jd.success && jd.job) {
            setCrawlerLog((prev) => `${prev}\n\n--- Supabase CrawlerJob ---\n${JSON.stringify(jd.job, null, 2)}`);
          }
        } catch {
          /* ignore */
        }
      }
    } catch (e: unknown) {
      setCrawlerLog(`❌ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTriggering(false);
    }
  };

  const addSource = () => {
    const newSource: SourceConfig = {
      id: Date.now().toString(),
      url: '',
      type: 'devto',
      tags: [],
      keywords: [],
      enabled: true,
    };
    setConfig(prev => ({ ...prev, sources: [...prev.sources, newSource] }));
    setEditingSourceIndex(config.sources.length);
  };

  const updateSource = (index: number, updates: Partial<SourceConfig>) => {
    setConfig(prev => {
      const newSources = [...prev.sources];
      newSources[index] = { ...newSources[index], ...updates };
      return { ...prev, sources: newSources };
    });
  };

  const removeSource = async (index: number) => {
    const newSources = config.sources.filter((_, i) => i !== index);
    setConfig(prev => ({
      ...prev,
      sources: newSources,
    }));
    if (editingSourceIndex === index) {
      setEditingSourceIndex(null);
    }
    // Persist after delete
    await saveConfigWithSources(newSources);
  };

  const saveConfigWithSources = async (sources: SourceConfig[]) => {
    setSaving(true);
    try {
      const scheduleToSave = config.schedule === 'custom' ? customSchedule : config.schedule;
      const res = await fetch('/api/admin/crawler-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, schedule: scheduleToSave, sources }),
      });
      const json = await res.json();
      if (!json.success) {
        console.error('Save failed:', json.error);
      }
    } catch (e: any) {
      console.error('Save failed:', e.message);
    } finally {
      setSaving(false);
    }
  };

  const addTagToSource = (sourceIndex: number) => {
    if (!newTag.trim()) return;
    const source = config.sources[sourceIndex];
    updateSource(sourceIndex, { tags: [...source.tags, newTag.trim()] });
    setNewTag('');
  };

  const removeTagFromSource = (sourceIndex: number, tagIndex: number) => {
    const source = config.sources[sourceIndex];
    updateSource(sourceIndex, { tags: source.tags.filter((_, i) => i !== tagIndex) });
  };

  const addKeywordToSource = (sourceIndex: number) => {
    if (!newKeyword.trim()) return;
    const source = config.sources[sourceIndex];
    updateSource(sourceIndex, { keywords: [...source.keywords, newKeyword.trim()] });
    setNewKeyword('');
  };

  const removeKeywordFromSource = (sourceIndex: number, keywordIndex: number) => {
    const source = config.sources[sourceIndex];
    updateSource(sourceIndex, { keywords: source.keywords.filter((_, i) => i !== keywordIndex) });
  };

  if (loading) {
    return (
      <div className="h-screen bg-palette-bgPrimary text-palette-textPrimary flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-palette-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-palette-bgPrimary text-palette-textPrimary">
      {/* Header */}
      <header className="h-14 border-b border-palette-border flex items-center px-6 bg-palette-bgSecondary">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-palette-textMuted hover:text-palette-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono font-bold text-palette-accent tracking-wider">⚙️ CRAWLER SETTINGS</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button
            size="sm"
            onClick={triggerCrawler}
            disabled={triggering}
            className="bg-palette-primary hover:bg-palette-primary-hover text-white"
          >
            {triggering ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            {triggering ? 'Dispatching...' : 'Run now'}
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </header>

      <main className="max-w-site mx-auto p-6 space-y-8">
        {/* Schedule Settings */}
        <section className="bg-palette-bgSecondary border border-palette-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-palette-accent" />
            <h2 className="text-lg font-semibold">Schedule</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-palette-textMuted min-w-[100px]">Enable scheduled crawler</Label>
              <Select 
                value={config.enabled ? 'true' : 'false'} 
                onValueChange={v => setConfig(prev => ({ ...prev, enabled: v === 'true' }))}
              >
                <SelectTrigger className="w-[180px] bg-palette-bgSecondary border-palette-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-palette-bgSecondary border-palette-border text-palette-textPrimary">
                  <SelectItem value="true">On</SelectItem>
                  <SelectItem value="false">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-palette-textMuted min-w-[100px]">Frequency</Label>
              <Select 
                value={scheduleOptions.find(o => o.value === config.schedule) ? config.schedule : 'custom'}
                onValueChange={v => setConfig(prev => ({ ...prev, schedule: v }))}
              >
                <SelectTrigger className="w-[200px] bg-palette-bgSecondary border-palette-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-palette-bgSecondary border-palette-border text-palette-textPrimary">
                  {scheduleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {config.schedule === 'custom' && (
              <div className="flex items-center gap-4 ml-[100px]">
                <Input 
                  value={customSchedule}
                  onChange={e => setCustomSchedule(e.target.value)}
                  placeholder="Cron expression, e.g. 0 */2 * * *"
                  className="w-[300px] bg-palette-bgSecondary border-palette-border"
                />
                <span className="text-xs text-palette-textMuted">Format: min hour day month weekday</span>
              </div>
            )}
          </div>
        </section>

        {/* Translation Settings */}
        <section className="bg-palette-bgSecondary border border-palette-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-palette-accent" />
            <h2 className="text-lg font-semibold">Translation</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-palette-textMuted min-w-[150px]">Translate article body</Label>
              <Select 
                value={config.translateContent ? 'true' : 'false'} 
                onValueChange={v => setConfig(prev => ({ ...prev, translateContent: v === 'true' }))}
              >
                <SelectTrigger className="w-[180px] bg-palette-bgSecondary border-palette-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-palette-bgSecondary border-palette-border text-palette-textPrimary">
                  <SelectItem value="true">On (title + body)</SelectItem>
                  <SelectItem value="false">Off (title only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-palette-textMuted min-w-[150px]">Target languages</Label>
              <div className="flex gap-2 flex-wrap">
                {['zh', 'ja', 'ko', 'es', 'fr', 'de'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      const langs = config.translateTargetLanguages;
                      if (langs.includes(lang)) {
                        setConfig(prev => ({ ...prev, translateTargetLanguages: langs.filter(l => l !== lang) }));
                      } else {
                        setConfig(prev => ({ ...prev, translateTargetLanguages: [...langs, lang] }));
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      config.translateTargetLanguages.includes(lang)
                        ? 'bg-palette-primary text-white'
                        : 'bg-palette-bgSecondary text-palette-textMuted hover:bg-palette-bgTertiary'
                    }`}
                  >
                    {lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : lang === 'ko' ? 'Korean' : lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : 'German'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Source Settings */}
        <section className="bg-palette-bgSecondary border border-palette-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-palette-accent" />
              <h2 className="text-lg font-semibold">Data sources</h2>
            </div>
            <Button size="sm" onClick={addSource} className="bg-palette-primary hover:bg-palette-primary-hover">
              <Plus className="w-4 h-4 mr-1" /> Add source
            </Button>
          </div>
          
          <div className="space-y-4">
            {config.sources.map((source, index) => (
              <div key={source.id} className="border border-palette-border rounded-lg p-4 bg-palette-bgSecondary">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Source #{index + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${source.enabled ? 'bg-emerald-600/20 text-emerald-400' : 'bg-palette-bgTertiary text-palette-textMuted'}`}>
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={source.enabled ? 'true' : 'false'}
                      onValueChange={v => updateSource(index, { enabled: v === 'true' })}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs bg-palette-bgTertiary border-palette-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-palette-bgTertiary border-palette-border text-palette-textPrimary">
                        <SelectItem value="true">On</SelectItem>
                        <SelectItem value="false">Off</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeSource(index)}
                      className="h-7 w-7 p-0 text-palette-textMuted hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-palette-textMuted mb-1 block">Source type</Label>
                    <Select 
                      value={source.type}
                      onValueChange={v => updateSource(index, { type: v as SourceConfig['type'] })}
                    >
                      <SelectTrigger className="bg-palette-bgTertiary border-palette-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-palette-bgTertiary border-palette-border text-palette-textPrimary">
                        {sourceTypeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-palette-textMuted mb-1 block">URL / API</Label>
                    <Input 
                      value={source.url}
                      onChange={e => updateSource(index, { url: e.target.value })}
                      placeholder="https://dev.to or RSS URL"
                      className="bg-palette-bgTertiary border-palette-border"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <Label className="text-xs text-palette-textMuted mb-1 block">Tag filter</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {source.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-palette-primary/20 text-palette-accent rounded text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTagFromSource(index, tagIndex)} className="hover:text-palette-accent">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Type a tag and press Enter"
                      className="h-7 text-xs bg-palette-bgTertiary border-palette-border"
                      onKeyDown={e => e.key === 'Enter' && addTagToSource(index)}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <Label className="text-xs text-palette-textMuted mb-1 block">Keyword filter</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {source.keywords.map((kw, kwIndex) => (
                      <span key={kwIndex} className="px-2 py-1 bg-palette-bgTertiary text-palette-accent rounded text-xs flex items-center gap-1 border border-palette-border">
                        {kw}
                        <button onClick={() => removeKeywordFromSource(index, kwIndex)} className="hover:text-palette-accent">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newKeyword}
                      onChange={e => setNewKeyword(e.target.value)}
                      placeholder="Type a keyword and press Enter"
                      className="h-7 text-xs bg-palette-bgTertiary border-palette-border"
                      onKeyDown={e => e.key === 'Enter' && addKeywordToSource(index)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {config.sources.length === 0 && (
              <div className="text-center py-8 text-palette-textMuted">
                No sources yet — click Add source above.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Dispatch log modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-site bg-palette-bgCard border border-palette-border rounded-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-palette-border">
              <h3 className="font-mono font-bold text-palette-accent tracking-wider">
                📋 Dispatch result (crawl continues in cloud)
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-palette-textMuted hover:text-palette-textSecondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Log body */}
            <div className="p-4 h-96 overflow-y-auto font-mono text-xs text-palette-textSecondary bg-palette-bgPrimary whitespace-pre-wrap">
              {crawlerLog || 'Waiting for response…'}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-palette-border bg-palette-bgCard flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-palette-textMuted">
                {crawlerLog.startsWith('❌') ? (
                  <span className="text-red-400">Request failed</span>
                ) : crawlerLog ? (
                  <span className="text-emerald-400">Request finished (crawl continues in GitHub Actions)</span>
                ) : null}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(crawlerLog);
                }}
                className="text-xs text-palette-textMuted hover:text-palette-accent transition-colors"
              >
                Copy log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
