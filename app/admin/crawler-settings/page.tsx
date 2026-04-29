'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, RefreshCw, Save, Plus, Trash2, Clock, Globe, Languages } from 'lucide-react';

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
  { value: '0 * * * *', label: '每小时一次' },
  { value: '0 */6 * * *', label: '每6小时一次' },
  { value: '0 0 * * *', label: '每天一次' },
  { value: '0 0 */2 * *', label: '每2天一次' },
  { value: '0 0 * * 0', label: '每周一次' },
  { value: 'custom', label: '自定义' },
];

const sourceTypeOptions = [
  { value: 'devto', label: 'Dev.to' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'github', label: 'GitHub' },
  { value: 'rss', label: 'RSS Feed' },
  { value: 'custom', label: '自定义网站' },
];

export default function CrawlerSettingsPage() {
  const [config, setConfig] = useState<CrawlerConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
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
        alert('配置已保存');
      } else {
        alert(`保存失败: ${json.error}`);
      }
    } catch (e: any) {
      alert(`保存失败: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const triggerCrawler = async () => {
    setTriggering(true);
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
    // 删除后立即保存
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
        console.error('保存失败:', json.error);
      }
    } catch (e: any) {
      console.error('保存失败:', e.message);
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
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-zinc-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono font-bold text-cyan-400 tracking-wider">⚙️ CRAWLER SETTINGS</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={triggerCrawler} 
            disabled={triggering}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {triggering ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            {triggering ? '运行中...' : '立即运行'}
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Schedule Settings */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold">定时设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-zinc-400 min-w-[100px]">启用定时爬虫</Label>
              <Select 
                value={config.enabled ? 'true' : 'false'} 
                onValueChange={v => setConfig(prev => ({ ...prev, enabled: v === 'true' }))}
              >
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-zinc-400 min-w-[100px]">执行频率</Label>
              <Select 
                value={scheduleOptions.find(o => o.value === config.schedule) ? config.schedule : 'custom'}
                onValueChange={v => setConfig(prev => ({ ...prev, schedule: v }))}
              >
                <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
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
                  placeholder="Cron 表达式，如: 0 */2 * * *"
                  className="w-[300px] bg-zinc-800 border-zinc-700"
                />
                <span className="text-xs text-zinc-500">格式: 分 时 日 月 星期</span>
              </div>
            )}
          </div>
        </section>

        {/* Translation Settings */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold">翻译设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-zinc-400 min-w-[150px]">翻译文章内容</Label>
              <Select 
                value={config.translateContent ? 'true' : 'false'} 
                onValueChange={v => setConfig(prev => ({ ...prev, translateContent: v === 'true' }))}
              >
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="true">启用（同时翻译标题和正文）</SelectItem>
                  <SelectItem value="false">禁用（仅翻译标题）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-zinc-400 min-w-[150px]">目标语言</Label>
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
                        ? 'bg-cyan-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {lang === 'zh' ? '中文' : lang === 'ja' ? '日本語' : lang === 'ko' ? '한국어' : lang === 'es' ? 'Español' : lang === 'fr' ? 'Français' : 'Deutsch'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Source Settings */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">数据源设置</h2>
            </div>
            <Button size="sm" onClick={addSource} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-1" /> 添加数据源
            </Button>
          </div>
          
          <div className="space-y-4">
            {config.sources.map((source, index) => (
              <div key={source.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">数据源 #{index + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${source.enabled ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                      {source.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={source.enabled ? 'true' : 'false'}
                      onValueChange={v => updateSource(index, { enabled: v === 'true' })}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs bg-zinc-700 border-zinc-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-700 border-zinc-600 text-zinc-100">
                        <SelectItem value="true">启用</SelectItem>
                        <SelectItem value="false">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeSource(index)}
                      className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-zinc-400 mb-1 block">数据源类型</Label>
                    <Select 
                      value={source.type}
                      onValueChange={v => updateSource(index, { type: v as SourceConfig['type'] })}
                    >
                      <SelectTrigger className="bg-zinc-700 border-zinc-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-700 border-zinc-600 text-zinc-100">
                        {sourceTypeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400 mb-1 block">URL / API</Label>
                    <Input 
                      value={source.url}
                      onChange={e => updateSource(index, { url: e.target.value })}
                      placeholder="https://dev.to 或 RSS 地址"
                      className="bg-zinc-700 border-zinc-600"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <Label className="text-xs text-zinc-400 mb-1 block">标签过滤</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {source.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTagFromSource(index, tagIndex)} className="hover:text-cyan-300">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="输入标签后回车"
                      className="h-7 text-xs bg-zinc-700 border-zinc-600"
                      onKeyDown={e => e.key === 'Enter' && addTagToSource(index)}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <Label className="text-xs text-zinc-400 mb-1 block">关键字过滤</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {source.keywords.map((kw, kwIndex) => (
                      <span key={kwIndex} className="px-2 py-1 bg-violet-600/20 text-violet-400 rounded text-xs flex items-center gap-1">
                        {kw}
                        <button onClick={() => removeKeywordFromSource(index, kwIndex)} className="hover:text-violet-300">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newKeyword}
                      onChange={e => setNewKeyword(e.target.value)}
                      placeholder="输入关键字后回车"
                      className="h-7 text-xs bg-zinc-700 border-zinc-600"
                      onKeyDown={e => e.key === 'Enter' && addKeywordToSource(index)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {config.sources.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                暂无数据源，点击上方"添加数据源"按钮添加
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
