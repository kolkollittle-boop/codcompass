# CloudQuery.io 手机版本 (Mobile) 布局 & 样式分析

**分析时间:** 2026-05-04
**测试设备:** iPhone (Safari, 390×844)
**分析页面:** 首页 + 产品页 + 定价页 + 博客 + 文档 + Hub

---

## 1. 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router, RSC) |
| UI 库 | **MUI v5** (Material UI) |
| 响应式方案 | **MUI sx prop** 内联断点 + CSS |
| 断点系统 | MUI 默认: xs(<600), sm(600-900), md(900-1200), lg(1200-1536), xl(1536+) |
| 图标 | MUI SvgIcon + 自定义 SVG |
| 动画 | CSS Keyframes + inline sx |

---

## 2. 断点策略

```
xs  (< 600px)   → 手机
sm  (600-900)   → 平板竖屏
md  (900-1200)  → 平板横屏
lg  (1200-1536) → 笔记本
xl  (> 1536)    → 大屏桌面
```

**核心模式:** MUI sx prop 中直接使用对象断点语法
```jsx
sx={{
  fontSize: { md: "48px", xs: "36px" },
  direction: { sm: "row", xs: "column" },
  display: { lg: "block", xs: "none" },
  gap: { md: 6, xs: 2 },
  paddingY: { md: 8, xs: 5 },
}}
```

---

## 3. 手机端各区域布局分析

### 3.1 导航栏 (TopBar)

**桌面:** Logo — 导航链接 — CTA 按钮 (水平排列)
**手机:** Logo — ☰ 汉堡菜单图标 (右侧)

```css
/* 导航栏 */
height: 56px;
position: fixed;
background: #0E1320;
border-bottom: 1px solid #29303D;
z-index: 1100; /* MUI AppBar */
```

**手机菜单:** MUI Drawer (右侧滑出)
- 背景: `#0E1320`
- 导航链接垂直排列
- 每个链接 padding 增大 (适合触摸)
- CTA 按钮在底部

---

### 3.2 Hero 区域

**桌面:** 左文字 + 右动画 (两列)
**手机:** 全居中 + 动画隐藏

| 属性 | 桌面 (md+) | 手机 (xs) |
|------|-----------|----------|
| 标题字号 | 48px | **36px** |
| 标题字重 | 700 | 700 |
| 文字对齐 | left | **center** |
| 副标题字号 | 16px | 16px |
| 副标题颜色 | text.secondary | text.secondary |
| CTA 方向 | row | **column** (上下排列) |
| CTA 间距 | gap: 2 | gap: 2 |
| 动画区域 | 500×500 显示 | **display: none** |
| paddingY | 8 (64px) | 5 (40px) |
| 最大宽度 | 530px | **100%** |

```jsx
// Hero 标题
sx={{
  fontSize: { md: "48px", xs: "36px" },
  marginBottom: 3,
  marginX: { md: 0, xs: "auto" },
  maxWidth: 530,
}}

// Hero 内容区
sx={{
  alignItems: { lg: "flex-start", xs: "center" },
  textAlign: { lg: "left", xs: "center" },
  width: "100%",
}}

// 动画区域 (手机隐藏)
sx={{
  display: { lg: "block", xs: "none" },
  height: 500,
  width: 500,
}}

// CTA 按钮组
sx={{
  direction: { sm: "row", xs: "column" },
  gap: 2,
}}
```

---

### 3.3 Logo 条 (信任背书)

**桌面 & 手机:** 相同 — 无限滚动动画

```css
/* 滚动动画 */
@keyframes loop {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 30px)); }
}
animation: loop 30s linear infinite;

/* Logo 图片滤镜 (白色化) */
filter: brightness(0) saturate(100%) invert(70%) sepia(4%)
        saturate(619%) hue-rotate(173deg) brightness(93%) contrast(92%);

/* 两侧渐变遮罩 */
left: 0; width: 30px;
background: linear-gradient(270deg, rgba(14,19,32,0) 0%, #0e1320 100%);
```

---

### 3.4 特性卡片 (3 列 → 1 列)

**桌面:** 3 列 (flex: 1 1 calc(33.333% - 16px))
**平板:** 2 列 (flex: 1 1 calc(50% - 12px))
**手机:** **1 列** (flex: 1 1 100%)

| 属性 | 桌面 | 手机 |
|------|------|------|
| 图标区高度 | 64px | 64px |
| 图标字号 | 48 | 48 |
| 卡片标题 | 24px | **20px** |
| 卡片描述 | 16px | **14px** |
| 内边距 | 4 (32px) | **3 (24px)** |
| maxWidth | 380px | **100%** |
| minWidth | 280px | **100%** |
| 背景 | rgba(249,249,251,0.03) | 同 |
| 边框 | 1px solid rgba(255,255,255,0.08) | 同 |
| backdropFilter | blur(10px) | blur(10px) |
| borderRadius | 3 (24px) | 3 (24px) |

```jsx
// 卡片 flex 响应式
flex: {
  md: "1 1 calc(33.333% - 16px)",
  sm: "1 1 calc(50% - 12px)",
  xs: "1 1 100%",
}
maxWidth: { md: 380, xs: "100%" }
minWidth: { md: 280, xs: "100%" }
padding: { md: 4, xs: 3 }

// 标题
fontSize: { md: 24, xs: 20 }

// 描述
fontSize: { md: 16, xs: 14 }
```

---

### 3.5 平台特性卡片 (2 列 → 1 列)

**桌面:** 2 列水平排列 (图标左 + 文字右)
**手机:** **1 列** (图标上 + 文字下)

| 属性 | 桌面 | 手机 |
|------|------|------|
| 卡片布局 | row (图标+文字并排) | **column** (上下排列) |
| 卡片 padding | 3 (24px) | 3 (24px) |
| hover 效果 | translateY(-2px) + 绿色边框 | 同 |
| 背景 | rgba(249,249,251,0.03) | 同 |
| 边框 | rgba(255,255,255,0.08) | 同 |

```jsx
// 容器 (区块标题)
sx={{
  gap: 2,
  marginX: "auto",
  maxWidth: 700,
}}
// 卡片方向由父级 Grid 控制 (md: 2列, xs: 1列)
```

---

### 3.6 客户案例 (Reddit)

**桌面:** 左文字 + 右图片 (row)
**手机:** **上图下文** (column-reverse)

| 属性 | 桌面 | 手机 |
|------|------|------|
| 方向 | row | **column-reverse** |
| 图片占比 | flex: 0 0 45% | **flex: 1** (全宽) |
| 标题字号 | 40px | **28px** |
| 描述字号 | 18px | **16px** |
| 内边距 | 6 (48px) | **4 (32px)** |
| gap | 6 | 4 |
| hover | translateY(-4px) | 同 |

```jsx
sx={{
  direction: { md: "row", xs: "column-reverse" },
  gap: { md: 6, xs: 4 },
  padding: { md: 6, xs: 4 },
}}
// 图片
flex: { md: "0 0 45%", xs: "1" }
maxWidth: { md: "45%", xs: "100%" }
```

---

### 3.7 多云集成区

**桌面:** 左标题 + 右特性列表 (row)
**手机:** **上下排列** (column)

| 属性 | 桌面 | 手机 |
|------|------|------|
| 方向 | row | **column** |
| gap | 6 | 2 |
| marginBottom | 5 | 5 |
| 背景 | linear-gradient(180deg, #111727, #0E1320) | 同 |

---

### 3.8 代码块 + 特性列表 (2 列 → 1 列)

**桌面:** 左特性列表 + 右代码块 (grid: 1fr 1fr)
**手机:** **上下排列** (grid: 1fr)

| 属性 | 桌面 | 手机 |
|------|------|------|
| gridTemplateColumns | 1fr 1fr | **1fr** |
| columnGap | 7.5 (60px) | 7.5 (60px) |
| rowGap | 18 (144px) | **7.5 (60px)** |
| textAlign | left | **center** |

**代码块:**
| 属性 | 桌面 | 手机 |
|------|------|------|
| 代码字号 | 14px | **12px** |
| 代码 padding | 3 (24px) | **2 (16px)** |
| 背景 | rgba(0,0,0,0.3) | 同 |
| 边框 | 1px solid rgba(255,255,255,0.08) | 同 |
| borderRadius | 2 (16px) | 同 |
| 交通灯 | 3 色圆点 | 同 |

```jsx
// 双列网格
gridTemplateColumns: { md: "1fr 1fr", xs: "1fr" }
rowGap: { md: 18, xs: 7.5 }
textAlign: { md: "left", xs: "center" }

// 代码
fontSize: { md: 14, xs: 12 }
padding: { md: 3, xs: 2 }
```

---

### 3.9 CLI vs Platform 双卡片

**桌面:** 2 列并排
**手机:** **上下排列**

| 属性 | 桌面 | 手机 |
|------|------|------|
| 方向 | row | **column** |
| 卡片 flex | 1 1 0 | **1** (全宽) |
| 卡片 maxWidth | 400px | **100%** |
| 标题字号 | 22px | **20px** |
| 描述字号 | 14px | **13px** |
| 背景 | rgba(249,249,251,0.03) | 同 |
| backdropFilter | blur(10px) | 同 |

```jsx
sx={{
  flexDirection: { md: "row", xs: "column" },
}}
// 卡片
flex: { md: "1 1 0", xs: "1" }
maxWidth: { md: 400, xs: "100%" }
```

---

### 3.10 插件/集成列表

**桌面:** grid auto-fill minmax(256px, 1fr)
**手机:** **1 列** (256px 超宽时自动变 1 列)

| 属性 | 值 |
|------|------|
| gridTemplateColumns | repeat(auto-fill, minmax(256px, 1fr)) |
| gap | 2.25 (18px) |
| 图标尺寸 | 40×40 |
| 卡片 paddingY | 1.5 (12px) |
| 卡片 paddingX | 2.25 (18px) |
| hover 背景 | rgba(249,249,251,0.06) |

---

### 3.11 博客卡片

**桌面:** 3 列 (md: 4)
**平板:** 2 列 (sm: 6)
**手机:** **1 列** (xs: 12)

```jsx
// Grid 响应式
size: { md: 4, sm: 6, xs: 12 }

// 卡片图片
height: 180px (固定)
objectFit: "cover"

// 标题
WebkitLineClamp: 2 (最多 2 行)
overflow: "hidden"

// 描述
WebkitLineClamp: 3 (最多 3 行)
color: text.secondary

// 作者 + 日期
direction: row
spacing: 1.5
头像: 28×28 circular
```

---

### 3.12 页脚 (Footer)

**桌面:** 4-5 列
**手机:** **1 列** (垂直堆叠)

| 属性 | 桌面 | 手机 |
|------|------|------|
| 列数 | 4-5 | **1** |
| 分割线 | hr 分隔 | 同 |
| 版权文字 | caption 大小 | 同 |
| 社交图标 | 水平排列 | 水平排列 |

---

### 3.13 Cookie 横幅

**桌面 & 手机:** 相同 — 底部固定弹窗

```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
z-index: 1300;
background: #111927;
border-top: 1px solid #29303D;
padding: 16px 24px;
```

---

### 3.14 文档页 (Docs) 手机端

**桌面:** 左侧边栏 (280px) + 主内容 + 右侧 TOC
**手机:** **隐藏侧边栏** + 全宽内容 + 顶部汉堡菜单

```css
/* 侧边栏 */
@media (max-width: 900px) {
  .docs-sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .docs-sidebar.open {
    transform: translateX(0);
  }
}
/* 主内容 */
@media (max-width: 900px) {
  .docs-content {
    margin-left: 0; /* 去掉侧边栏偏移 */
    padding: 16px;
  }
}
/* TOC 隐藏 */
@media (max-width: 1200px) {
  .docs-toc { display: none; }
}
```

---

## 4. 手机端字体缩放表

| 元素 | 桌面 (md+) | 平板 (sm) | 手机 (xs) |
|------|-----------|----------|----------|
| Hero 标题 | 48px | 40px | **36px** |
| H2 区块标题 | 36px | 28px | **24px** |
| H3 卡片标题 | 24px | 22px | **20px** |
| H5 副标题 | 22px | 20px | **18px** |
| body1 正文 | 16px | 15px | **14-16px** |
| body2 辅助 | 14px | 13px | **13-14px** |
| caption 小字 | 12px | 12px | **12px** |
| 代码 | 14px | 13px | **12px** |

---

## 5. 手机端间距缩放表

| 元素 | 桌面 | 手机 |
|------|------|------|
| 区块 paddingY | 8-19 (64-152px) | **5-10 (40-80px)** |
| 卡片 padding | 3-6 (24-48px) | **3-4 (24-32px)** |
| 卡片 gap | 2-6 (16-48px) | **2-4 (16-32px)** |
| 容器 maxWidth | xl (1536px) | 同 |
| 容器 paddingX | 6 (48px) | **4 (32px)** |

---

## 6. 手机端关键隐藏/显示规则

| 元素 | 桌面 | 手机 |
|------|------|------|
| Hero 动画 | ✅ 显示 | ❌ **隐藏** |
| 导航链接 | ✅ 水平显示 | ❌ 汉堡菜单 |
| 文档侧边栏 | ✅ 固定显示 | ❌ 抽屉式 |
| 文档 TOC | ✅ 右侧显示 | ❌ **隐藏** |
| Cookie 横幅 | ✅ 底部固定 | ✅ 同 |
| Logo 滚动条 | ✅ 显示 | ✅ 同 |
| 代码块 | ✅ 显示 | ✅ 字号缩小 |

---

## 7. 触摸优化

| 优化项 | 实现 |
|--------|------|
| 按钮最小点击区域 | 44px (MUI Button 默认) |
| 导航链接 padding | 增大 (适合手指) |
| 卡片 hover → tap | hover 效果在 touch 设备上变为 tap 反馈 |
| 滚动优化 | scrollPaddingTop: 80px (避免固定导航遮挡) |
| 图片 | Next.js Image (自动适配 DPR) |

---

## 8. 性能优化 (移动端)

| 优化 | 实现 |
|------|------|
| 图片懒加载 | loading="lazy" |
| 图片格式 | WebP (自动) |
| 代码分割 | Next.js dynamic imports |
| 字体 | 系统字体栈 (无需加载) |
| CSS | 单文件 (0yjihl7cc17.j.css, ~14KB) |
| Hero 动画 | 手机直接隐藏 (省性能) |
