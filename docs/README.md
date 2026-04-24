# 📚 Codcompass Knowledge Base

> **High-Quality Technical Knowledge for Developers**
> 
> 基于 OpenClaw + Hermes 的自动化内容生产引擎，面向欧美市场的技术知识库付费平台

![Status](https://img.shields.io/badge/status-planning-blue)
![License](https://img.shields.io/badge/license-proprietary-red)
![Target](https://img.shields.io/badge/market-US%2C%20EU%2C%20UAE-green)

---

## 🎯 项目愿景

打造一个**高质量技术知识库付费平台**，通过 AI 驱动的内容采集、加工和重组，为欧美开发者提供独特视角的技术教程和实战指南。

**目标收入**: $10k MRR within 6 months

---

## 💡 核心价值

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📚 系统化教程    🤖 AI 驱动生产    💎 独特风格           │
│   不是碎片文章     不是简单搬运     不是千篇一律           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 技术架构

```
                    ┌──────────────┐
                    │   用户层     │
                    │  Next.js +   │
                    │   Stripe     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   应用层     │
                    │  API + CMS   │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   OpenClaw    │  │    Hermes     │  │  内容加工引擎  │
│   爬虫调度    │  │   AI 写作助手  │  │  去重/改写    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   数据层     │
                    │ PG + Redis   │
                    └──────────────┘
```

---

## 📦 会员套餐

| 套餐 | 价格 | 核心权益 |
|------|------|----------|
| Free | $0 | 每日 3 篇文章 |
| Builder | $29/月 | 无限阅读 + 代码下载 |
| Pro | $59/月 | + 源码仓库 + 优先支持 |
| Enterprise | $99/月 | + 1v1 咨询 + 团队许可 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, NextAuth |
| Database | PostgreSQL (Supabase), Prisma |
| Cache | Upstash Redis |
| Search | Meilisearch |
| AI | Claude API, Hermes Agent, Vercel AI SDK |
| Crawler | OpenClaw, Python |
| Payment | Lemon Squeezy |
| i18n | next-intl |
| Hosting | Vercel |

---

## 📅 开发计划

```
Week 1-4:  MVP 开发
Week 5-8:  内容填充
Week 9-10: 正式发布

Target Launch: June 30, 2026
```

---

## 📂 项目结构

```
CodcompassApp/
├── docs/                    # 项目文档
│   ├── 项目文档.md          # 详细文档
│   └── README.md            # 本文件
├── src/                     # 源代码
│   ├── crawlers/            # 爬虫模块
│   ├── processors/          # 内容处理
│   ├── api/                 # API 服务
│   └── web/                 # 网站前端
├── config/                  # 配置文件
├── tests/                   # 测试用例
└── assets/                  # 静态资源
```

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd CodcompassApp

# 2. 安装依赖
npm install
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API keys

# 4. 启动开发服务器
npm run dev
```

---

## 📖 相关文档

- [完整项目文档](./docs/项目文档.md) - 详细的技术架构、爬虫设计、合规指南
- [Karpathy Guidelines](./CLAUDE.md) - AI 编码规范

---

## ⚖️ 合规声明

- ✅ 内容经过 AI 改写和人工审核
- ✅ 明确标注参考来源
- ✅ 遵循合理使用原则
- ✅ 图片敏感信息打码处理
- ✅ GDPR/CCPA 合规

---

## 📬 联系方式

**项目地址**: ~/Desktop/CodcompassWeb

**目标市场**: 🇺🇸 🇨🇦 🇬🇧 🇩🇪 🇦🇪

---

*Built with ❤️ by OpenClaw + Hermes*
