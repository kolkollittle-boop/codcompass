'use client';

import { useState } from 'react';
import { Download, FileCode, CheckCircle, FileText } from 'lucide-react';

export default function BlueprintPreview() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full max-w-lg mx-auto lg:mx-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 主卡片 */}
      <div className="relative bg-palette-bgCard border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-palette-bgSecondary border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-palette-primary" />
            <span className="text-xs font-mono text-palette-textMuted">Production Blueprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
          </div>
        </div>

        {/* 代码预览区 */}
        <div className="p-4 font-mono text-xs leading-relaxed">
          <div className="text-palette-textMuted"># docker-compose.yml</div>
          <div className="mt-2">
            <span className="text-purple-400">version</span>
            <span className="text-palette-textMuted">: </span>
            <span className="text-green-400">'3.8'</span>
          </div>
          <div>
            <span className="text-purple-400">services</span>
            <span className="text-palette-textMuted">:</span>
          </div>
          <div className="pl-2">
            <span className="text-palette-primary">rag-pipeline</span>
            <span className="text-palette-textMuted">:</span>
          </div>
          <div className="pl-4">
            <span className="text-purple-400">image</span>
            <span className="text-palette-textMuted">: </span>
            <span className="text-green-400">codcompass/rag-advanced:latest</span>
          </div>
          <div className="pl-4">
            <span className="text-purple-400">environment</span>
            <span className="text-palette-textMuted">:</span>
          </div>
          <div className="pl-6">
            <span className="text-palette-textMuted">- </span>
            <span className="text-green-400">OPENAI_API_KEY=${'{API_KEY}'}</span>
          </div>
          <div className="pl-6">
            <span className="text-palette-textMuted">- </span>
            <span className="text-green-400">VECTOR_DB_URL=pgvector://...</span>
          </div>
        </div>

        {/* 底部文件列表 */}
        <div className="px-4 py-3 bg-palette-bgTertiary border-t border-white/[0.08]">
          <div className="flex items-center gap-3 text-xs text-palette-textMuted">
            <FileText className="w-3.5 h-3.5" />
            <span>docker-compose.yml</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-palette-textMuted mt-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>checklist.md</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-palette-textMuted mt-1.5">
            <FileCode className="w-3.5 h-3.5" />
            <span>config_template.json</span>
          </div>
        </div>
      </div>

      {/* 悬浮下载按钮 */}
      <div 
        className={`absolute -top-3 -right-3 transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button className="flex items-center gap-2 px-4 py-2 bg-palette-primary hover:bg-palette-primary-hover text-white text-xs font-medium rounded-lg shadow-lg shadow-cc-theme transition-colors">
          <Download className="w-3.5 h-3.5" />
          Download Blueprint
        </button>
      </div>

      {/* 背景装饰 */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[color-mix(in_srgb,var(--primary)_18%,transparent)] to-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-2xl -z-10 rounded-3xl" />
    </div>
  );
}
