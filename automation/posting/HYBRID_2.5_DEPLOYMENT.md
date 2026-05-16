# 精益分发矩阵 2.5

**部署日期:** 2026-05-16
**架构师:** 贾维斯 + 老大

---

## 架构总览

```
 ┌──────────────────────────────┐
 │ 贾维斯推流核心 (Cron) │
 └──────────────┬───────────────┘
 │
 ┌─────────────────────────┴────────────────────────┐
 ▼ ▼
【全自动闪击通道 P0】 【人机协同通道 P1】
 ├─ Dev.to (REST API, 已通) ├─ Reddit (9527 端口-自动选板块+手动Ctrl+V)
 ├─ Twitter/X (CLI, 已通) ├─ Quora (9527 端口-自动注入)
 └─ [草稿生成] ├─ Medium (9527 端口-过盾)
 ├─ Hashnode (草稿)
 └─ HN (草稿，karma=1)
```

---

## 已完成配置

### 1. 老大浏览器 (Port 9527)
- **启动命令:** `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9527 &`
- **OpenClaw 配置:** `browser.profiles.user` → `cdpPort: 9527, attachOnly: true`
- **注意:** 必须先 Cmd+Q 完全退出 Chrome，再跑启动命令

### 2. API 闪击队
- **Dev.to:** ✅ 已通，API key 在 .env.local
- **Twitter/X:** ✅ 已通，twitter-cli 已安装

### 3. Cron 任务
- **Job ID:** `63b8fab7-048c-47b4-ab35-77342cb91ea3`
- **名称:** daily-tech-posting (Matrix 2.5)
- **时间:** 美东 10:00, 14:00, 18:00 (北京 22:00, 02:00, 06:00)
- **前置:** 进程清洗 (pkill chrome-isolated + openclaw.*browser)

### 4. API 发帖脚本
- **路径:** `/Users/kol/Desktop/CyberPunkWeb/automation/posting/api-post.sh`
- **修复:** zsh 变量扩展问题 ($0.12 → /bin/zsh.12) 已用 jq -Rs 安全编码解决

---

## 平台状态

| 平台 | 方式 | 状态 | 备注 |
|------|------|------|------|
| Dev.to | API | ✅ 已通 | 注意 $ 符号转义修复 |
| Twitter/X | CLI | ✅ 已通 | 需配置 twitter-cli auth |
| Hashnode | ~~API~~ → 草稿 | ⏸️ API 已废弃 (2026-05-13) | 手动发布 |
| HN | 草稿 | ⏸️ karma=1 | 等号养肥 |
| Quora | 浏览器 9527 | ⏳ 待测试 | 需老大登录 |
| Medium | 浏览器 9527 | ⏳ 待测试 | 需老大登录 + 过 Cloudflare |
| Reddit | 浏览器 9527 | ⏳ 待测试 | 需老大登录 + reCAPTCHA |

---

## 变更日志

| 日期 | 变更 | 状态 |
|------|------|------|
| 2026-05-16 | Matrix 2.5 上线 | ✅ |
| 2026-05-16 | 端口 9222 → 9527 (绕过 GoogleUpdater) | ✅ |
| 2026-05-16 | api-post.sh zsh 转义修复 | ✅ |
| 2026-05-16 | Hashnode 降级为草稿模式 | ✅ |
| 2026-05-16 | Cron 加入进程清洗 | ✅ |
| 2026-05-16 | SKILL.md 更新 | ✅ |
