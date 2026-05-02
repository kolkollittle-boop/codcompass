'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
}

const TreeItem = ({ href, label, isNew = false }: TreeItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href as any}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-palette-primary/10 text-palette-primary font-medium'
          : 'text-palette-textSecondary hover:bg-palette-bgSecondary hover:text-palette-textPrimary'
        }
      `}
    >
      <BookOpen className="w-4 h-4 opacity-70" />
      <span className="flex-1 truncate">{label}</span>
      {isNew && (
        <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      )}
    </Link>
  );
};

const TreeNode = ({ label, icon, children, defaultOpen = false }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-palette-textPrimary hover:bg-palette-bgSecondary transition-colors"
      >
        {icon || <FileText className="w-4 h-4 opacity-70" />}
        <span className="flex-1 text-left font-medium">{label}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 opacity-50" />
        ) : (
          <ChevronRight className="w-4 h-4 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="pl-6 mt-1 space-y-0.5 border-l border-palette-border ml-6">
          {children}
        </div>
      )}
    </div>
  );
};

export function SidebarTree() {
  return (
    <aside className="w-64 h-full bg-palette-bgPrimary border-r border-palette-border overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-palette-textPrimary mb-4 px-3">
          Knowledge Base
        </h2>
        <nav className="space-y-1">
          <TreeNode
            label="RAG 生产实战路径"
            icon={<Zap className="w-4 h-4 text-palette-primary" />}
            defaultOpen={true}
          >
            <TreeItem href="/en/kb/rag-intro" label="RAG 基础概念" />
            <TreeItem href="/en/kb/rag-architecture" label="RAG 架构设计" />
            <TreeItem href="/en/kb/rag-indexing" label="索引策略" />
            <TreeItem href="/en/kb/rag-retrieval" label="检索优化" />
            <TreeItem href="/en/kb/rag-evaluation" label="评估与监控" />
            <TreeItem href="/en/kb/rag-production" label="生产部署" isNew />
            <TreeItem href="/en/kb/rag-pitfalls" label="7 个常见陷阱" />
          </TreeNode>

          <TreeNode label="AI Agent 开发" icon={<Code className="w-4 h-4 text-emerald-400" />}>
            <TreeItem href="/en/kb/agent-basics" label="Agent 基础" />
            <TreeItem href="/en/kb/agent-tools" label="工具调用" />
            <TreeItem href="/en/kb/agent-planning" label="规划与执行" />
          </TreeNode>

          <TreeNode label="数据库与向量" icon={<Database className="w-4 h-4 text-blue-400" />}>
            <TreeItem href="/en/kb/vector-db" label="向量数据库" />
            <TreeItem href="/en/kb/embeddings" label="Embedding 模型" />
            <TreeItem href="/en/kb/hybrid-search" label="混合搜索" />
          </TreeNode>

          <TreeNode label="系统架构" icon={<Layers className="w-4 h-4 text-purple-400" />}>
            <TreeItem href="/en/kb/microservices" label="微服务设计" />
            <TreeItem href="/en/kb/api-design" label="API 设计" />
            <TreeItem href="/en/kb/caching" label="缓存策略" />
          </TreeNode>

          <TreeNode label="安全与合规" icon={<Shield className="w-4 h-4 text-red-400" />}>
            <TreeItem href="/en/kb/auth" label="认证与授权" />
            <TreeItem href="/en/kb/data-privacy" label="数据隐私" />
            <TreeItem href="/en/kb/rate-limiting" label="速率限制" />
          </TreeNode>

          <TreeNode label="运维与配置" icon={<Settings className="w-4 h-4 text-orange-400" />}>
            <TreeItem href="/en/kb/monitoring" label="监控与告警" />
            <TreeItem href="/en/kb/ci-cd" label="CI/CD 流水线" />
            <TreeItem href="/en/kb/config-mgmt" label="配置管理" />
          </TreeNode>
        </nav>
      </div>
    </aside>
  );
}

export default SidebarTree;
