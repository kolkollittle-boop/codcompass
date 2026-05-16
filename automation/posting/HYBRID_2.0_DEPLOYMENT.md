#  全平台推流战术修正方案 (Hybrid 2.0)

**部署日期:** 2026-05-16
**架构师:** 贾维斯 + 老大

---

## 📐 架构总览

```
 ┌──────────────────────────────┐
 │ 贾维斯推流核心 (Cron) │
 └──────────────┬───────────────┘
 │
 ┌─────────────────────────┴────────────────────────┐
 ▼ ▼
【纯 API 闪击队】(无需浏览器) 【老大浏览器特攻队】(直连 Port 9222)
 ├─ Dev.to (REST API) ├─ Quora (浏览器自动化)
 ├─ Hashnode (GraphQL API) ├─ Medium (浏览器自动化)
 ─ Twitter/X (CLI) ├─ Reddit (浏览器+手动辅助)
 │
 ─ HN (仅草稿，karma 不足)
```

---

## ✅ 已完成配置

### 1. 老大浏览器共享 (Port 9222)
- **启动命令:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/Library/Application Support/Google/Chrome" &`
- **OpenClaw 配置:** `browser.profiles.user` → `cdpUrl: ws://127.0.0.1:9222/devtools/browser/...`
- **确认 Cookie:** Dev.to ✅, Hashnode ✅ (已确认有 session cookie)
- **缺失 Cookie:** Quora ❌, Medium ❌, Reddit ❌ (需老大手动登录)

### 2. Cron 任务更新
- **Job ID:** `63b8fab7-048c-47b4-ab35-77342cb91ea3`
- **名称:** daily-tech-posting (Hybrid 2.0)
- **时间:** 美东 10:00, 14:00, 18:00 (北京 22:00, 02:00, 06:00)
- **Payload:** Hybrid 2.0 执行指令（含 API + 浏览器双路径）

### 3. API 发帖脚本
- **路径:** `/Users/kol/Desktop/CyberPunkWeb/automation/posting/api-post.sh`
- **用法:** `./api-post.sh devto title.md content.md`

---

## 🔑 待配置项 (老大操作)

### API Keys (写入 `.env.local`)
```bash
# Dev.to API Key
# 获取: https://dev.to/settings/extensions → API Keys
DEVTO_API_KEY=your_devto_key_here

# Hashnode API Token
# 获取: https://hashnode.com/settings/developer → Generate Token
HASHNODE_API_TOKEN=your_hashnode_token_here

# Hashnode Publication ID
# 获取: 打开你的 publication → 设置 → 复制 ID (UUID 格式)
HASHNODE_PUBLICATION_ID=your_publication_id_here
```

### 浏览器登录 (手动操作)
1. **Quora:** 打开 https://quora.com 登录
2. **Medium:** 打开 https://medium.com 登录
3. **Reddit:** 打开 https://reddit.com 登录（可选，有 reCAPTCHA 风险）

登录完成后，Cron 会自动共享这些 Cookie。

---

## 📋 平台状态一览

| 平台 | 方式 | 登录态 | 阻塞 | 优先级 |
|------|------|--------|------|--------|
| Dev.to | API | ✅ | API key 已配置 | ✅ 已跑通 |
| Hashnode | ~~API~~ → 浏览器 | ✅ Cookie 存在 | GraphQL API 已转为付费（2026-05-13） | 改走浏览器 |
| Twitter/X | CLI | 已跑通 | 无 | P1 |
| Quora | 浏览器 | ❌ 未登录 | 需老大登录 | P1 |
| Medium | 浏览器 | ❌ 未登录 | 需老大登录 | P1 |
| Reddit | 浏览器 | ❌ 未登录 | 需登录 + reCAPTCHA 风险 | P2 |
| HN | 草稿 | N/A | karma=1 | P3 |

---

## 🔄 执行流程

```
Cron 触发 (美东 10/14/18)
  ↓
Step 0: 检查基础设施
  ├─ curl 127.0.0.1:9222 → 浏览器在线？
  ├─ 检查 .env.local → API keys 存在？
  └─ 检查 cookie → 各平台登录态？
  ↓
Step 1: 内容准备
  ├─ 选主题 (Codcompass 最新 OR 开发内容)
  ├─ 生成 6 平台适配版本
  └─ 缓存到 content_cache/
  ↓
Step 2: API 闪击队发布 (优先)
  ├─ Dev.to → curl API → 获取 URL
  └─ Hashnode → GraphQL → 获取 URL
  ↓
Step 3: 浏览器特攻队发布
  ├─ Quora → profile=user → 发帖
  ├─ Medium → profile=user → 发帖
  └─ Reddit → profile=user → 尝试发帖
  ↓
Step 4: 汇总报告 → Feishu 群通知
```

---

##  故障排查

### API 发帖失败
- 检查 API key/token 是否正确
- 检查网络连通性: `curl -I https://dev.to/api/articles`
- 查看脚本输出日志

### 浏览器发帖失败
- 检查 Port 9222 是否监听: `curl http://127.0.0.1:9222/json/version`
- 检查 cookie 是否过期: 重新登录对应平台
- Cloudflare 盾: 标记需人工处理

### Cron 不触发
- 检查 cron 状态: `cron list`
- 检查 API 配额: 如报 concurrency quota exceeded，等待下次
- 手动触发: `cron run --job-id 63b8fab7-...`

---

## 📝 变更日志

| 日期 | 变更 | 负责人 |
|------|------|--------|
| 2026-05-16 | Hybrid 2.0 架构上线 | 贾维斯 + 老大 |
| 2026-05-16 | user browser profile 配置完成 | 贾维斯 |
| 2026-05-16 | Cron payload 更新为 Hybrid 2.0 指令 | 贾维斯 |
| 2026-05-16 | API 发帖脚本创建 | 贾维斯 |
| 2026-05-16 | traffic-agent 记忆更新 | 贾维斯 |
