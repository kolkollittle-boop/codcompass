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
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="docs-card my-10 overflow-hidden rounded-xl border border-docs-border bg-docs-surface">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-docs-bg">
            <FileCode className="h-6 w-6 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Production Bundle</h3>
            <p className="text-sm text-zinc-500">Full productivity bundle for this article · $29 value</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-zinc-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-6 border-t border-docs-border p-6">
          {blueprintUrl && (
            <div className="flex items-center justify-between rounded-lg border border-docs-border bg-docs-bg p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-docs-surface">
                  <Download className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">{blueprintName || 'Production Blueprint'}</p>
                  <p className="text-xs text-zinc-500">docker-compose · config scripts · benchmarks · README</p>
                </div>
              </div>
              <a
                href={blueprintUrl}
                download
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          )}

          {checklist.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Pitfall checklist</h4>
                <span className="text-xs text-zinc-500">
                  {checkedCount}/{checklist.length} done
                </span>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      checkedItems[item.id]
                        ? 'border-docs-border-hover bg-white/[0.04]'
                        : 'border-transparent bg-docs-bg hover:border-docs-border'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {checkedItems[item.id] ? (
                        <CheckSquare className="h-5 w-5 text-zinc-300" />
                      ) : (
                        <Square className="h-5 w-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.icon === 'warning' && <AlertTriangle className="h-4 w-4 text-zinc-500" />}
                        {item.icon === 'shield' && <Shield className="h-4 w-4 text-zinc-500" />}
                        <span
                          className={`text-sm ${
                            checkedItems[item.id] ? 'text-zinc-600 line-through' : 'text-zinc-400'
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isPro && (
            <div className="border-t border-docs-border pt-4 text-center">
              <p className="text-sm text-zinc-500">
                Upgrade to <span className="font-medium text-zinc-300">Pro</span> to unlock the full bundle and more series
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
