// automation/crawler/src/ai-scorer.ts
import OpenAI from "openai";
import dotenv from 'dotenv';
import path from 'path';

// 1. 🚀 加载环境变量（支持在 automation/crawler 子目录执行）
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '..', '..', '.env.local') });

// 2. 延迟创建客户端，避免启动时因找不到 Key 报错
let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://coding.dashscope.aliyuncs.com/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return client;
}

export async function scoreArticle(title: string, content: string) {
  const systemPrompt = `
Please return the result in a strict JSON format.

你是一位资深技术编辑（极客导师风格：专业、干练、结果导向，不说废话）。
请对以下技术文章进行评分和评估。

**评分矩阵 (总分 100):**
1. 实操性 (40 分): 是否有可运行的代码、排错指南、具体步骤？
2. 时效性 (30 分): 技术栈是否过时？是否为当前主流版本？
3. 独特性 (20 分): 是否有独家见解或深度解析？（拒绝文档搬运工）
4. 商业价值 (10 分): 对付费用户是否有高价值？

**强制扣分项:**
- 发现营销引流/焦虑标题/广告 -> 扣 50 分。
- 纯理论无代码/水文 -> 扣 20 分。

**输出要求:**
仅输出严格的 JSON，不要包含 Markdown 格式代码块，不要任何前缀。
JSON 结构:
{
  "score": 85,
  "dimensions": { "practicality": 40, "timeliness": 25, "uniqueness": 15, "business": 5 },
  "difficulty_level": "L1",
  "is_promotional": false,
  "mentor_summary": "极简两句话总结核心价值，直击痛点",
  "webhook_action": "push_discord"
}

Title: ${title}
Content Preview: ${content.substring(0, 1200)}...
`;

  try {
    const c = getClient();
    
    const completion = await c.chat.completions.create({
      model: "qwen3.5-plus", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Title: ${title}\nContent: ${content.substring(0, 1500)}...` }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (e) {
    console.error("AI Scoring Failed:", e);
    return { score: 0, is_promotional: true, error: "API Error" };
  }
}
