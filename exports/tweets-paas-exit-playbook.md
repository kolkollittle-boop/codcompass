# Twitter/X 推文（手动发，分时段）

---

## 推文 1 — 数据钩子型
建议时间：今天或明天中午

```
Heroku costs $2,800/mo for a Series A startup stack.

We migrated 6 startups to self-hosted Docker in 72 hours.

The result: $45/mo. Same workload. Better reliability.

Here's the exact playbook:

https://www.codcompass.com/articles/complete-paas-exit-playbook-heroku-to-self-hosted-in-72-hours
```

---

## 推文 2 — 痛点型
建议时间：推文1 之后 4-6 小时

```
Your PaaS provider isn't your friend.

They sell you convenience. Then tax you for every add-on, every dyno tier, every log line.

A typical Rails app on Heroku:
• Web dyno: $250
• Postgres: $50
• Redis: $15
• CI/CD: $30
• Logging: $50

Total for what costs $5 on a VPS: $395/mo

Full exit playbook:
https://www.codcompass.com/articles/complete-paas-exit-playbook-heroku-to-self-hosted-in-72-hours
```

---

## 推文 3 — 代码型
建议时间：推文2 之后 12-16 小时

配图：截 docker-compose.yml 代码块，深色主题

```
The entire migration comes down to one file: docker-compose.yml

App + Postgres + Redis + Traefik. 60 lines.

Replaces 4 Heroku dynos and 3 add-ons.

Read the full 72-hour playbook:

https://www.codcompass.com/articles/complete-paas-exit-playbook-heroku-to-self-hosted-in-72-hours
```

---

## Dev.to / Hashnode 底部钩子（已加在文章末尾）

```markdown
---

> 💡 This article is part of [CodCompass](https://www.codcompass.com) — a developer knowledge base focused on production-grade engineering practices. We cover AI cost optimization, architecture migration, and infrastructure automation. [Read the full article on CodCompass →](https://www.codcompass.com/articles/complete-paas-exit-playbook-heroku-to-self-hosted-in-72-hours)
```
