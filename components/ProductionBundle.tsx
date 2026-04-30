'use client';

import { useState } from 'react';
import { Download, CheckSquare, Square, ChevronDown, ChevronUp, FileCode, Shield, AlertTriangle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  icon?: 'warning' | 'info' | 'shield';
}

interface ProductionBundleProps {
  blueprintUrl?: string | null;
  blueprintName?: string | null;
  checklist?: ChecklistItem[];
  isPro?: boolean;
}

export default function ProductionBundle({
  blueprintUrl,
  blueprintName,
  checklist = [],
  isPro = false,
}: ProductionBundleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleChecklistItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl my-10 overflow-hidden">
      {/* 头部 - 可点击展开 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileCode className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-zinc-100">
              Production Bundle
            </h3>
            <p className="text-sm text-zinc-500">
              本篇完整生产力工具包 · 价值 $29
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-6 space-y-6">
          {/* Blueprint 下载 */}
          {blueprintUrl && (
            <div className="bg-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {blueprintName || 'Production Blueprint'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    docker-compose · 配置脚本 · 基准测试 · README
                  </p>
                </div>
              </div>
              <a
                href={blueprintUrl}
                download
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          )}

          {/* 避坑 Checklist */}
          {checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  避坑 Checklist
                </h4>
                <span className="text-xs text-zinc-500">
                  {checkedCount}/{checklist.length} 已完成
                </span>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`
                      w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors
                      ${checkedItems[item.id] ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-zinc-800/30 hover:bg-zinc-800/50'}
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {checkedItems[item.id] ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.icon === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {item.icon === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
                        <span className={`text-sm ${checkedItems[item.id] ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pro 用户提示 */}
          {!isPro && (
            <div className="pt-4 border-t border-zinc-800 text-center">
              <p className="text-sm text-zinc-400">
                升级 <span className="text-cyan-400 font-medium">Pro</span> 解锁完整 Bundle 和更多专题
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
