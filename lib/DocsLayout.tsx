//components/docs/DocsLayout.tsx 实现建议'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { KbNavNode, getKbNavTree } from '@/lib/kb-nav-tree';
import DocsSidebarNav from './DocsSidebarNav';
import DocsToc from './DocsToc';
import DocsSearchTrigger from './DocsSearchTrigger';
import { Menu, X } from 'lucide-react'; // 建议使用 lucide-react 处理图标

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navTree = getKbNavTree();

  // 路由变化时自动关闭移动端菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="docs-shell flex flex-col min-h-screen bg-[#000000] text-zinc-200">
      
      {/* 移动端 Sticky 工具栏 (仅在 md 以下显示) */}
      <div className="sticky top-16 z-30 flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-md border-b border-docs-border lg:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <DocsSearchTrigger isMobile />
      </div>

      <div className="flex flex-1 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 左侧边栏 (Desktop: 固定; Mobile: 滑入) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-[280px] bg-black transform transition-transform duration-300 ease-in-out
          lg:sticky lg:top-16 lg:z-0 lg:translate-x-0 lg:block lg:h-[calc(100vh-64px)] lg:border-r lg:border-docs-border
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full py-6 pr-4 overflow-y-auto docs-scroll">
            {/* 仿 CloudQuery 搜索按钮 */}
            <div className="mb-6 px-2">
              <DocsSearchTrigger />
            </div>
            <nav className="flex-1">
              <DocsSidebarNav nodes={navTree} />
            </nav>
          </div>
        </aside>

        {/* 中间正文区域 */}
        <main className="flex-1 min-w-0 py-8 lg:px-8">
          <div id="docs-content" className="max-w-[75ch] mx-auto">
            {children}
          </div>
        </main>

        {/* 右侧 TOC (仅桌面端) */}
        <aside className="hidden xl:block w-[240px] sticky top-16 h-[calc(100vh-64px)] py-8 overflow-y-auto docs-scroll">
          <DocsToc />
        </aside>

      </div>

      {/* 移动端遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}