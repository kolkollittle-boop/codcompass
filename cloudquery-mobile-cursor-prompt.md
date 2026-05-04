# CloudQuery 手机版本提示词 (供 Cursor 使用)

---

## 设计指令

将项目调整为 **CloudQuery.io 手机版本** 的视觉风格和响应式布局。以下是完整的移动端设计规范：

---

## 1. 断点系统

```css
/* MUI 默认断点 */
--breakpoint-xs: 0px;      /* 手机 */
--breakpoint-sm: 600px;    /* 平板竖屏 */
--breakpoint-md: 900px;    /* 平板横屏 */
--breakpoint-lg: 1200px;   /* 笔记本 */
--breakpoint-xl: 1536px;   /* 大屏 */

/* 使用方式 (Tailwind 等价) */
@media (max-width: 599px)   { /* 手机 */ }
@media (min-width: 600px) and (max-width: 899px)  { /* 平板 */ }
@media (min-width: 900px) and (max-width: 1199px) { /* 平板横屏 */ }
@media (min-width: 1200px)  { /* 桌面 */ }
```

---

## 2. 手机端字体

```css
/* 手机端字号 (xs 断点) */
--text-hero-mobile: 36px;      /* Hero 标题 */
--text-h2-mobile: 24px;        /* 区块标题 */
--text-h3-mobile: 20px;        /* 卡片标题 */
--text-body-mobile: 14-16px;   /* 正文 */
--text-small-mobile: 13px;     /* 辅助文字 */
--text-caption-mobile: 12px;   /* 小字/代码 */

/* 桌面端字号 (md+ 断点) */
--text-hero-desktop: 48px;
--text-h2-desktop: 36px;
--text-h3-desktop: 24px;
--text-body-desktop: 16px;
--text-small-desktop: 14px;
--text-caption-desktop: 14px;
```

---

## 3. 导航栏 (移动端)

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #0E1320;
  border-bottom: 1px solid #29303D;
  z-index: 1100;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.navbar-logo {
  flex-shrink: 0;
}
/* 桌面导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* 手机: 隐藏链接，显示汉堡 */
@media (max-width: 899px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
@media (min-width: 900px) {
  .hamburger { display: none; }
}

/* 手机抽屉菜单 */
.mobile-drawer {
  position: fixed;
  top: 56px;
  right: 0;
  bottom: 0;
  width: 280px;
  background: #0E1320;
  border-left: 1px solid #29303D;
  z-index: 1200;
  padding: 16px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}
.mobile-drawer.open {
  transform: translateX(0);
}
.mobile-drawer-link {
  display: block;
  padding: 12px 16px;
  color: #C8CBD0;
  font-size: 16px;
  border-radius: 8px;
  text-decoration: none;
}
.mobile-drawer-link:hover {
  background: rgba(255,255,255,0.05);
  color: #EDF2F7;
}
```

---

## 4. Hero 区域 (移动端)

```css
.hero {
  padding: 40px 16px;
  text-align: center;
}
@media (min-width: 1200px) {
  .hero {
    padding: 64px 16px;
    text-align: left;
    display: grid;
    grid-template-columns: 1fr 500px;
    align-items: center;
    gap: 48px;
  }
}
.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: #EDF2F7;
  line-height: 1.2;
  margin-bottom: 16px;
  width: 100%;
}
@media (min-width: 1200px) {
  .hero-title {
    font-size: 48px;
    max-width: 530px;
    margin-left: 0;
    margin-right: 0;
  }
}
.hero-subtitle {
  font-size: 16px;
  color: #6C737F;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
}
/* 动画区域 - 手机隐藏 */
.hero-animation {
  display: none;
}
@media (min-width: 1200px) {
  .hero-animation {
    display: block;
    width: 500px;
    height: 500px;
    flex-shrink: 0;
  }
}
/* CTA 按钮组 */
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
@media (min-width: 600px) {
  .hero-actions {
    flex-direction: row;
  }
}
```

---

## 5. Logo 滚动条

```css
.logo-bar {
  background: #0E1320;
  padding: 24px 0;
  overflow: hidden;
}
.logo-track {
  display: inline-flex;
  align-items: center;
  gap: 30px;
  animation: logoScroll 30s linear infinite;
}
@keyframes logoScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 30px)); }
}
.logo-item {
  height: 24px;
  width: auto;
  /* 白色化滤镜 */
  filter: brightness(0) saturate(100%) invert(70%) sepia(4%)
          saturate(619%) hue-rotate(173deg) brightness(93%) contrast(92%);
  flex-shrink: 0;
}
/* 两侧渐变遮罩 */
.logo-bar::before,
.logo-bar::after {
  content: '';
  position: absolute;
  top: 0;
  height: 24px;
  width: 30px;
  z-index: 2;
}
.logo-bar::before {
  left: 0;
  background: linear-gradient(270deg, rgba(14,19,32,0) 0%, #0e1320 100%);
}
.logo-bar::after {
  right: 0;
  background: linear-gradient(90deg, rgba(14,19,32,0) 0%, #0e1320 100%);
}
```

---

## 6. 特性卡片 (响应式网格)

```css
.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
.feature-card {
  flex: 1 1 100%;
  max-width: 100%;
  min-width: 100%;
  background: rgba(249, 249, 251, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}
@media (min-width: 600px) {
  .feature-card {
    flex: 1 1 calc(50% - 12px);
    max-width: calc(50% - 12px);
  }
}
@media (min-width: 900px) {
  .feature-card {
    flex: 1 1 calc(33.333% - 16px);
    max-width: 380px;
    min-width: 280px;
    padding: 32px;
  }
}
.feature-icon {
  height: 64px;
  display: flex;
  align-items: flex-start;
  color: #17B264;
  font-size: 48px;
  margin-bottom: 12px;
}
.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #EDF2F7;
  margin-bottom: 8px;
  min-height: auto;
}
@media (min-width: 900px) {
  .feature-title {
    font-size: 24px;
    min-height: 64px;
  }
}
.feature-desc {
  font-size: 14px;
  color: #6C737F;
  line-height: 1.6;
}
@media (min-width: 900px) {
  .feature-desc {
    font-size: 16px;
  }
}
```

---

## 7. 客户案例卡片 (响应式)

```css
.case-study-card {
  background: rgba(249, 249, 251, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.case-study-inner {
  display: flex;
  flex-direction: column-reverse;
  gap: 16px;
  padding: 32px;
  align-items: center;
}
@media (min-width: 900px) {
  .case-study-inner {
    flex-direction: row;
    gap: 48px;
    padding: 48px;
  }
}
.case-study-text {
  flex: 1;
  min-width: 0;
  text-align: center;
}
@media (min-width: 900px) {
  .case-study-text {
    text-align: left;
  }
}
.case-study-title {
  font-size: 28px;
  font-weight: 700;
  color: #EDF2F7;
  margin-bottom: 12px;
}
@media (min-width: 900px) {
  .case-study-title {
    font-size: 40px;
  }
}
.case-study-desc {
  font-size: 16px;
  color: #6C737F;
  margin-bottom: 16px;
}
@media (min-width: 900px) {
  .case-study-desc {
    font-size: 18px;
  }
}
.case-study-image {
  flex: 1;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 900px) {
  .case-study-image {
    flex: 0 0 45%;
    max-width: 45%;
  }
}
.case-study-card:hover {
  border-color: rgba(23, 178, 100, 0.4);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
}
.case-study-card:hover .case-study-image {
  transform: scale(1.02);
}
.case-study-card:hover .arrow-icon {
  transform: translateX(4px);
}
```

---

## 8. 代码块 (移动端优化)

```css
.code-block {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}
.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.code-dots {
  display: flex;
  gap: 4px;
}
.code-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.code-dots span:nth-child(1) { background: #FF5F56; }
.code-dots span:nth-child(2) { background: #FFBD2E; }
.code-dots span:nth-child(3) { background: #27CA40; }
.code-filename {
  color: #6C737F;
  font-size: 12px;
  margin-left: 8px;
}
.code-content {
  padding: 16px;
  margin: 0;
  overflow-x: auto;
  font-family: "Fira Code", "Monaco", "Menlo", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #D2D6DB;
}
@media (min-width: 900px) {
  .code-content {
    padding: 24px;
    font-size: 14px;
  }
}
/* 语法高亮 */
.code-keyword { color: #C678DD; }
.code-string { color: #98C379; }
.code-function { color: #61AFEF; }
.code-comment { color: #5C6370; font-style: italic; }
.code-number { color: #D19A66; }
```

---

## 9. 双列网格 (代码+特性)

```css
.dual-grid {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 60px;
  text-align: center;
}
@media (min-width: 900px) {
  .dual-grid {
    grid-template-columns: 1fr 1fr;
    row-gap: 144px;
    column-gap: 60px;
    text-align: left;
  }
}
```

---

## 10. CLI vs Platform 双卡片

```css
.path-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  width: 100%;
}
@media (min-width: 900px) {
  .path-cards {
    flex-direction: row;
  }
}
.path-card {
  flex: 1;
  max-width: 100%;
  background: rgba(249, 249, 251, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 900px) {
  .path-card {
    flex: 1 1 0;
    max-width: 400px;
  }
}
.path-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}
.path-card-title {
  font-size: 20px;
  font-weight: 600;
  color: #EDF2F7;
}
@media (min-width: 900px) {
  .path-card-title {
    font-size: 22px;
  }
}
.path-card-desc {
  font-size: 13px;
  color: #6C737F;
}
@media (min-width: 900px) {
  .path-card-desc {
    font-size: 14px;
  }
}
```

---

## 11. 博客卡片网格

```css
.blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 600px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .blog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.blog-card-image {
  height: 180px;
  object-fit: cover;
  width: 100%;
}
.blog-card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  color: #EDF2F7;
  margin-bottom: 8px;
}
.blog-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  color: #6C737F;
  line-height: 1.5;
  margin-bottom: 12px;
}
.blog-card-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.blog-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
```

---

## 12. 插件/集成列表

```css
.plugin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 600px) {
  .plugin-grid {
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
  }
}
.plugin-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: rgba(249, 249, 251, 0.03);
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s ease;
}
.plugin-item:hover {
  background: rgba(249, 249, 251, 0.06);
}
.plugin-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.plugin-name {
  font-size: 16px;
  font-weight: 600;
  color: #EDF2F7;
}
```

---

## 13. 页脚 (移动端)

```css
.footer {
  background: #0E1320;
  border-top: 1px solid #29303D;
  padding: 64px 16px 32px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto 48px;
}
@media (min-width: 600px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.footer-col-title {
  font-size: 14px;
  font-weight: 600;
  color: #EDF2F7;
  margin-bottom: 16px;
}
.footer-link {
  display: block;
  font-size: 14px;
  color: #6C737F;
  text-decoration: none;
  padding: 4px 0;
}
.footer-link:hover {
  color: #C8CBD0;
}
.footer-social {
  display: flex;
  gap: 16px;
  justify-content: center;
}
@media (min-width: 900px) {
  .footer-social {
    justify-content: flex-start;
  }
}
.footer-bottom {
  text-align: center;
  font-size: 12px;
  color: #5C6370;
  padding-top: 32px;
  border-top: 1px solid #29303D;
}
```

---

## 14. Cookie 横幅

```css
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111927;
  border-top: 1px solid #29303D;
  padding: 16px 24px;
  z-index: 1300;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
}
@media (min-width: 600px) {
  .cookie-banner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
.cookie-title {
  font-size: 16px;
  font-weight: 600;
  color: #EDF2F7;
}
.cookie-desc {
  font-size: 14px;
  color: #6C737F;
}
.cookie-actions {
  display: flex;
  gap: 8px;
}
```

---

## 15. 文档页 (移动端)

```css
/* 桌面: 侧边栏固定 */
.docs-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}
@media (max-width: 899px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-sidebar {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1100;
    background: #0E1320;
    border-right: 1px solid #29303D;
  }
  .docs-sidebar.open {
    transform: translateX(0);
  }
  .docs-content {
    padding: 16px;
  }
  /* TOC 隐藏 */
  .docs-toc { display: none; }
}
@media (min-width: 1200px) {
  .docs-layout {
    grid-template-columns: 280px 1fr 200px;
  }
}
```

---

## 16. 触摸优化

```css
/* 最小点击区域 */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* 防止双击缩放 */
@media (hover: none) {
  * {
    -webkit-tap-highlight-color: transparent;
  }
}

/* 滚动优化 */
html {
  scroll-padding-top: 80px; /* 固定导航高度 */
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
```

---

## 17. 性能优化 (移动端)

```css
/* 图片 */
img {
  max-width: 100%;
  height: auto;
}

/* 隐藏桌面动画 (省性能) */
@media (max-width: 1199px) {
  .hero-animation { display: none !important; }
}

/* 代码块横向滚动 */
.code-content {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* 字体 - 使用系统字体 */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  /* 无需加载额外字体文件 */
}
```

---

## 18. 色彩 (与桌面相同)

```css
/* 背景 */
--bg-primary: #0E1320;
--bg-card: #111927;
--bg-card-alt: #15202E;
--bg-input: #1C2536;
--bg-border: #29303D;
--bg-green-dark: #022723;
--bg-green-subtle: rgba(23, 178, 100, 0.1);

/* 文字 */
--text-primary: #EDF2F7;
--text-body: #D2D6DB;
--text-secondary: #C8CBD0;
--text-muted: #6C737F;
--text-faint: #5C6370;

/* 强调 */
--accent: #17B264;
--accent-hover: #27CA40;
```

---

## 使用方式

将以上 CSS 整合到项目中：

- **Tailwind 项目:** 将变量加入 `tailwind.config.js`，断点用 `@media` 或 Tailwind 的 `sm:`/`md:` 前缀
- **CSS Modules:** 直接放入 `globals.css`
- **Styled Components:** 放入 theme 对象，用 `@media` 做响应式
- **MUI 项目:** 用 `sx={{ fontSize: { md: "48px", xs: "36px" } }}` 语法
