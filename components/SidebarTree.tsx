'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FileText,
  Code,
  Database,
  Settings,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';

interface TreeItemProps {
  href: string;
  label: string;
  isNew?: boolean;
}

interface TreeNodeProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hrefs?: string[];
}

const TreeItem = ({ href, label, isNew = false }: TreeItemProps) => {
  const pathname = usePathname();
  // Handle both with and without locale prefix
  const isActive = pathname === href || pathname.endsWith(href);

  return (
    <Link
      href={href as any}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150
        ${isActive
          ? 'bg-[hsl(var(--codcompass-brand-bg))] text-[hsl(var(--codcompass-brand-glow))] font-medium border-l-2 border-[hsl(var(--codcompass-brand))]'
          : 'text-[hsl(var(--codcompass-text-muted))] hover:bg-[hsl(var(--codcompass-surface-hover))] hover:text-[hsl(var(--codcompass-text-secondary))]'
        }
      `}
    >
      <BookOpen className="w-3.5 h-3.5 opacity-60" />
      <span className="flex-1 truncate leading-tight">{label}</span>
      {isNew && (
        <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
      )}
    </Link>
  );
};

const TreeNode = ({ label, icon, children, defaultOpen = false, hrefs = [] }: TreeNodeProps) => {
  const pathname = usePathname();
  const hasActiveChild = hrefs.some(href => pathname === href || pathname.endsWith(href));
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors
          ${hasActiveChild 
            ? 'text-[hsl(var(--codcompass-text-secondary))] font-medium' 
            : 'text-[hsl(var(--codcompass-text-muted))] hover:text-[hsl(var(--codcompass-text-secondary))]'
          }`}
      >
        {icon}
        <span className="flex-1 text-left truncate">{label}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="pl-4 mt-0.5 space-y-0 border-l border-[hsl(var(--codcompass-border))] ml-3">
          {children}
        </div>
      )}
    </div>
  );
};

export function SidebarTree() {
  return (
    <aside className="w-60 min-h-screen bg-[hsl(var(--codcompass-background))] border-r border-[hsl(var(--codcompass-border))] overflow-y-auto flex-shrink-0">
      <div className="p-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <Zap className="w-4 h-4 text-[hsl(var(--codcompass-brand))]" />
          <h2 className="text-sm font-semibold text-[hsl(var(--codcompass-text-primary))]">
            Knowledge Base
          </h2>
        </div>
        <nav className="space-y-0.5">
          <TreeNode
            label="RAG 生产实战"
            icon={<Zap className="w-3.5 h-3.5 text-[hsl(var(--codcompass-brand))]" />}
            defaultOpen={true}
            hrefs={[
              "/kb/rag-intro",
              "/kb/rag-architecture",
              "/kb/rag-indexing",
              "/kb/rag-retrieval",
              "/kb/rag-evaluation",
              "/kb/rag-production",
              "/kb/rag-pitfalls",
            ]}
          >
            <TreeItem href="/kb/rag-intro" label="RAG 基础概念" />
            <TreeItem href="/kb/rag-architecture" label="RAG 架构设计" />
            <TreeItem href="/kb/rag-indexing" label="索引策略" />
            <TreeItem href="/kb/rag-retrieval" label="检索优化" />
            <TreeItem href="/kb/rag-evaluation" label="评估与监控" />
            <TreeItem href="/kb/rag-production" label="生产部署" isNew />
            <TreeItem href="/kb/rag-pitfalls" label="7 个常见陷阱" />
          </TreeNode>

          <TreeNode
            label="AI Agent 开发"
            icon={<Code className="w-3.5 h-3.5 text-emerald-400" />}
            hrefs={[
              "/kb/agent-basics",
              "/kb/agent-tools",
              "/kb/agent-planning",
            ]}
          >
            <TreeItem href="/kb/agent-basics" label="Agent 基础" />
            <TreeItem href="/kb/agent-tools" label="工具调用" />
            <TreeItem href="/kb/agent-planning" label="规划与执行" />
          </TreeNode>

          <TreeNode
            label="数据库与向量"
            icon={<Database className="w-3.5 h-3.5 text-cyan-400" />}
            hrefs={[
              "/kb/vector-db",
              "/kb/embeddings",
              "/kb/hybrid-search",
            ]}
          >
            <TreeItem href="/kb/vector-db" label="向量数据库" />
            <TreeItem href="/kb/embeddings" label="Embedding 模型" />
            <TreeItem href="/kb/hybrid-search" label="混合搜索" />
          </TreeNode>

          <TreeNode
            label="系统架构"
            icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
            hrefs={[
              "/kb/microservices",
              "/kb/api-design",
              "/kb/caching",
            ]}
          >
            <TreeItem href="/kb/microservices" label="微服务设计" />
            <TreeItem href="/kb/api-design" label="API 设计" />
            <TreeItem href="/kb/caching" label="缓存策略" />
          </TreeNode>

          <TreeNode
            label="安全与合规"
            icon={<Shield className="w-3.5 h-3.5 text-red-400" />}
            hrefs={[
              "/kb/auth",
              "/kb/data-privacy",
              "/kb/rate-limiting",
            ]}
          >
            <TreeItem href="/kb/auth" label="认证与授权" />
            <TreeItem href="/kb/data-privacy" label="数据隐私" />
            <TreeItem href="/kb/rate-limiting" label="速率限制" />
          </TreeNode>

          <TreeNode
            label="运维与配置"
            icon={<Settings className="w-3.5 h-3.5 text-orange-400" />}
            hrefs={[
              "/kb/monitoring",
              "/kb/ci-cd",
              "/kb/config-mgmt",
            ]}
          >
            <TreeItem href="/kb/monitoring" label="监控与告警" />
            <TreeItem href="/kb/ci-cd" label="CI/CD 流水线" />
            <TreeItem href="/kb/config-mgmt" label="配置管理" />
          </TreeNode>
        </nav>
      </div>
    </aside>
  );
}

export default SidebarTree;
