# CloudQuery 风格设计提示词 (供 Cursor 使用)

---

## 设计指令

将当前项目调整为与 **CloudQuery.io** 相同的视觉风格。以下是完整的设计规范：

---

## 1. 色彩系统

```css
/* 背景色 */
--bg-primary: #0E1320;       /* 页面主背景 */
--bg-card: #111927;          /* 卡片背景 */
--bg-card-alt: #15202E;      /* 次级卡片 */
--bg-input: #1C2536;         /* 输入框/代码块 */
--bg-border: #29303D;        /* 边框/分割线 */
--bg-green-dark: #022723;    /* 绿色调深色 */
--bg-green-subtle: rgba(23, 178, 100, 0.1); /* 绿色半透明 */

/* 文字色 */
--text-primary: #EDF2F7;     /* 主标题 */
--text-body: #D2D6DB;        /* 正文 */
--text-secondary: #C8CBD0;   /* 次要文字 */
--text-muted: #6C737F;       /* 辅助文字 */
--text-faint: #5C6370;       /* 更淡文字 */

/* 强调色 */
--accent: #17B264;           /* 主品牌绿色 */
--accent-hover: #27CA40;     /* hover */
--link-blue: #61AFEF;        /* 代码链接蓝 */
--code-green: #98C379;       /* 代码字符串绿 */
--code-link: #29D;           /* 代码链接 */

/* 窗口控制 */
--window-close: #FF5F56;     /* 红 */
--window-minimize: #FFBD2E;  /* 黄 */
```

---

## 2. 字体系统

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;

--text-xs: 0.75rem;    /* 12px - 小字 */
--text-sm: 0.875rem;   /* 14px - body2 */
--text-base: 1rem;     /* 16px - body1 */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px - H3 */
--text-2xl: 1.5rem;    /* 24px - H2 */
--text-3xl: 2.25rem;   /* 36px - Hero */

--font-normal: 400;
--font-semibold: 600;
--font-bold: 700;
```

---

## 3. 间距系统

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

---

## 4. 布局规范

```css
/* 容器 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* 卡片 */
.card {
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  padding: var(--space-6);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  border-color: rgba(23, 178, 100, 0.3);
  box-shadow: 0 0 20px rgba(23, 178, 100, 0.05);
}

/* 区块间距 */
.section {
  padding: var(--space-20) 0;
}
.section + .section {
  border-top: 1px solid var(--bg-border);
}
```

---

## 5. 按钮系统

```css
/* 主按钮 */
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-primary:active {
  transform: scale(0.98);
}

/* 次按钮 */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.btn-secondary:hover {
  border-color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
}

/* 链接按钮 */
.btn-link {
  background: none;
  border: none;
  color: var(--accent);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  text-decoration: none;
}
.btn-link:hover {
  text-decoration: underline;
}
```

---

## 6. 导航栏

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--bg-border);
  display: flex;
  align-items: center;
  z-index: 1000;
}
.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  padding: var(--space-2) var(--space-3);
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease;
}
.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}
.nav-link.active {
  color: var(--accent);
}
```

---

## 7. Hero 区域

```css
.hero {
  padding: var(--space-24) 0 var(--space-16);
  text-align: center;
}
.hero-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: var(--space-4);
}
.hero-subtitle {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 640px;
  margin: 0 auto var(--space-8);
}
.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-16);
}
```

---

## 8. 特性卡片 (Feature Grid)

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}
@media (max-width: 768px) {
  .feature-grid { grid-template-columns: 1fr; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  padding: var(--space-6);
  transition: border-color 0.2s ease;
}
.feature-card:hover {
  border-color: rgba(23, 178, 100, 0.3);
}
.feature-icon {
  width: 40px;
  height: 40px;
  color: var(--accent);
  margin-bottom: var(--space-4);
}
.feature-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.feature-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
}
```

---

## 9. 代码块

```css
.code-block {
  background: var(--bg-input);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  overflow: hidden;
  margin: var(--space-6) 0;
}
.code-block-header {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--bg-border);
}
.code-window-dots {
  display: flex;
  gap: 6px;
  margin-right: var(--space-4);
}
.code-window-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.code-window-dots span:nth-child(1) { background: var(--window-close); }
.code-window-dots span:nth-child(2) { background: var(--window-minimize); }
.code-window-dots span:nth-child(3) { background: var(--window-close); opacity: 0.5; }
.code-filename {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.code-block pre {
  padding: var(--space-4);
  margin: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-body);
}
/* 语法高亮 */
.code-keyword { color: var(--link-blue); }
.code-string { color: var(--code-green); }
.code-comment { color: var(--text-faint); font-style: italic; }
.code-function { color: var(--text-primary); }
.code-number { color: #D19A66; }
```

---

## 10. 标签/徽章

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}
.badge-green {
  background: var(--bg-green-subtle);
  color: var(--accent);
}
.badge-blue {
  background: rgba(97, 175, 239, 0.1);
  color: var(--link-blue);
}
.badge-gray {
  background: rgba(108, 115, 127, 0.08);
  color: var(--text-muted);
}
```

---

## 11. 状态指示器

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.status-running { background: var(--accent); }
.status-critical { background: var(--window-close); }
.status-warning { background: var(--window-minimize); }
.status-active { background: var(--link-blue); }
```

---

## 12. 表格

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--bg-border);
}
.data-table td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-body);
  border-bottom: 1px solid var(--bg-border);
}
.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
```

---

## 13. 动画

```css
/* 通用过渡 */
.transition-all {
  transition: all 0.2s ease-out;
}

/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* 发光脉冲 */
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 0 10px rgba(23, 178, 100, 0.5)); }
}
```

---

## 14. 页脚

```css
.footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--bg-border);
  padding: var(--space-16) 0 var(--space-8);
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  max-width: 1280px;
  margin: 0 auto var(--space-12);
  padding: 0 var(--space-6);
}
.footer-col-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}
.footer-link {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-decoration: none;
  padding: var(--space-1) 0;
  transition: color 0.2s ease;
}
.footer-link:hover {
  color: var(--text-secondary);
}
.footer-bottom {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-faint);
  padding-top: var(--space-8);
  border-top: 1px solid var(--bg-border);
}
```

---

## 15. 文档侧边栏

```css
.docs-sidebar {
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--bg-border);
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
}
.docs-sidebar-group {
  margin-bottom: var(--space-6);
}
.docs-sidebar-group-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-1);
}
.docs-sidebar-link {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: 6px;
  transition: background 0.15s ease, color 0.15s ease;
}
.docs-sidebar-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
.docs-sidebar-link.active {
  color: var(--accent);
  background: var(--bg-green-subtle);
}
```

---

## 使用方式

将以上 CSS 变量和样式规则整合到项目中：

- **Tailwind 项目:** 将变量加入 `tailwind.config.js` 的 `theme.extend`
- **CSS Modules:** 直接放在 `globals.css` 或 `variables.css`
- **Styled Components / Emotion:** 放入 theme 对象
- **MUI 项目:** 覆盖 `createTheme()` 的 palette 和 typography

### 本仓库（Codcompass / CyberPunkWeb）已对齐

- **色彩 / 语义色：**`tailwind.config.ts` 中 `theme.extend.colors.docs`（`bg-docs-bg`、`text-docs-accent`、`border-docs-border` 等），与上文 `--bg-primary`、`--accent` 等对应。
- **文档壳 + 营销壳：**`app/globals.css` 内 `.docs-shell`、`.cq-marketing`、`.docs-card` / `.docs-nav-item` / `.docs-toc-link` 与卡片 hover 光晕（`rgba(23, 178, 100, …)`）。
- **字体：**`app/layout.tsx` 使用 `next/font` 注入 **Inter**（`--font-inter`）与 **JetBrains Mono**（`--font-jetbrains-mono`），`tailwind.config.ts` 的 `fontFamily.sans` / `mono` 已绑定。
- **正文排版：**`@tailwindcss/typography` 的 `prose-invert` 已改用 `docs.*` 正文色、标题色与链接色（`--tw-prose-invert-links` → `#17B264`）。
