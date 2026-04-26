'use client';

import { useState } from 'react';

interface ArticleEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  mode?: 'edit' | 'preview';
}

export default function ArticleEditor({ 
  initialContent = '', 
  onSave, 
  mode = 'edit' 
}: ArticleEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(mode === 'preview');

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*') },
    { label: 'H1', title: 'Heading 1', action: () => insertLine('# ') },
    { label: 'H2', title: 'Heading 2', action: () => insertLine('## ') },
    { label: 'H3', title: 'Heading 3', action: () => insertLine('### ') },
    { label: 'List', title: 'Bullet List', action: () => insertLine('- ') },
    { label: 'Code', title: 'Code Block', action: () => insertMarkdown('```\n', '\n```') },
    { label: 'Link', title: 'Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Image', title: 'Image', action: () => insertMarkdown('![alt](', ')') },
    { label: 'Quote', title: 'Blockquote', action: () => insertLine('> ') },
  ];

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            {btn.label}
          </button>
        ))}
        <div className="flex-1"></div>
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            isPreview
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
        {onSave && (
          <button
            onClick={handleSave}
            className="px-4 py-1 text-sm font-medium bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Save
          </button>
        )}
      </div>

      {/* Editor */}
      {isPreview ? (
        <div
          className="prose prose-lg max-w-none p-6 min-h-[400px] bg-white"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-6 min-h-[400px] font-mono text-sm resize-y focus:outline-none"
          placeholder="Write your article content here..."
        />
      )}
    </div>
  );
}
