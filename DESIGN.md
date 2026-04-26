# Codcompass DESIGN.md — UI Design System

> Last updated: 2026-04-26
> Reference: [Aceternity UI](https://ui.aceternity.com/)
> Tech Stack: Next.js 16 + Tailwind CSS + Framer Motion + Lucide Icons

---

## 🎨 Design Philosophy

参考 Aceternity UI 的设计语言，追求：
- **暗黑科技感** — 深色背景 + 霓虹渐变 + 微光效果
- **动效驱动** — 滚动触发动画、hover 微交互、平滑过渡
- **内容聚焦** — 大字体标题、高对比度、清晰的视觉层级
- **现代极简** — 去除多余装饰，用渐变、模糊、光效营造质感

---

## 🌈 Color Palette

### Current (to upgrade)
- Background: `#0a0a0a` → 保持深色基调
- Primary: Tailwind `indigo-500` → 升级为渐变色
- Text: `zinc-100` / `zinc-400`

### Aceternity-Inspired Target
```css
/* 背景渐变 */
--bg-dark: #0a0a0a;
--bg-card: rgba(255, 255, 255, 0.03);
--bg-card-hover: rgba(255, 255, 255, 0.06);

/* 品牌渐变 */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-accent: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
--gradient-hero: linear-gradient(to bottom, rgba(99, 102, 241, 0.15), transparent);

/* 光效 */
--glow-primary: 0 0 40px rgba(99, 102, 241, 0.3);
--glow-accent: 0 0 60px rgba(124, 58, 237, 0.2);

/* 文字 */
--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--text-muted: #52525b;
```

---

## ✨ Aceternity UI 组件参考

### 可直接引入的核心组件

| 组件 | 用途 | 优先级 |
|------|------|--------|
| **Spotlight** | 首页/hero 区域聚光灯效果 | 🔴 高 |
| **MovingBorder** | 按钮/卡片发光边框 | 🔴 高 |
| **TextGenerateEffect** | 标题文字逐字出现动画 | 🟡 中 |
| **BackgroundGradient** | 卡片底部渐变光晕 | 🟡 中 |
| **HoverBorderGradient** | hover 时渐变边框 | 🟡 中 |
| **InfiniteMovingCards** | 首页功能展示横向滚动 | 🟢 低 |
| **GridGlobe** | 科技感网格地球背景 | 🟢 低 |
| **TracingBeam** | 文章/文档侧边追踪光束 | 🟡 中 |
| **Sparkles** | 背景粒子/星光效果 | 🟢 低 |
| **LampEffect** | 顶部聚光灯照射效果 | 🔴 高 |

### 安装方式
```bash
# 需要 framer-motion
npm install framer-motion clsx tailwind-merge

# Aceternity 组件需手动从文档复制（非 npm 包）
# 每个组件都是独立 TSX 文件，放在 components/ui/ 下
```

---

## 📐 Typography

```css
/* 标题层级 */
h1: 4xl-6xl, font-bold, bg-clip-text text-transparent bg-gradient-to-r
h2: 3xl-4xl, font-semibold
h3: xl-2xl, font-medium
body: base, leading-relaxed

/* 推荐字体 */
font-sans: Inter, -apple-system, sans-serif
font-mono: JetBrains Mono, monospace (代码/标签)
```

---

## 🃏 Card Design (Aceternity Style)

```tsx
// 核心特征
- 半透明背景: bg-white/[0.03]
- 细微边框: border border-white/[0.08]
- hover 发光: hover:bg-white/[0.06] transition-all
- 底部渐变光晕: ::after with radial-gradient
- 圆角: rounded-2xl (16px)
- 内边距: p-6
```

---

## 🎬 Animation Guidelines

| 类型 | 实现 | 示例 |
|------|------|------|
| 滚动入场 | framer-motion `whileInView` | 卡片淡入上移 |
| hover 放大 | `whileHover={{ scale: 1.02 }}` | 功能卡片 |
| 渐变流动 | CSS `@keyframes` + `background-size` | 按钮边框 |
| 鼠标跟随 | Spotlight/TextHoverEffect | Hero 区域 |
| 逐字出现 | TextGenerateEffect | 主标题 |

---

## 📋 待实施清单

### Phase 1 — 基础升级
- [ ] 安装 `framer-motion`
- [ ] 更新 `globals.css` 渐变和光效变量
- [ ] 引入 Spotlight 组件到首页 Hero
- [ ] 卡片统一改为 Aceternity 风格（半透明 + 发光）

### Phase 2 — 动效
- [ ] 首页文字使用 TextGenerateEffect
- [ ] 导航/按钮添加 MovingBorder 效果
- [ ] 文章列表添加 TracingBeam 侧边效果
- [ ] 滚动入场动画（whileInView）

### Phase 3 — 视觉增强
- [ ] Hero 区域 LampEffect 聚光灯
- [ ] Logo 设计（渐变文字 + 图标）
- [ ] Footer 科技网格背景
- [ ] 404/Loading 页面动效

---

## 🔧 技术规范

1. **动画性能**: 使用 `transform` 和 `opacity` 避免重排
2. **降级方案**: 禁用动画时 (`prefers-reduced-motion`) 显示静态内容
3. **组件复用**: 所有 Aceternity 组件放在 `components/ui/aceternity/`
4. **主题切换**: 保留 dark/light 切换能力（默认 dark）

---

## 📁 文件结构
```
components/ui/
├── Icon.tsx              # Lucide 图标系统 ✅
├── icons.ts              # 图标注册表 ✅
└── acernity/             # 待添加
    ├── spotlight.tsx
    ├── moving-border.tsx
    ├── text-generate.tsx
    ├── background-gradient.tsx
    └── tracing-beam.tsx
```
