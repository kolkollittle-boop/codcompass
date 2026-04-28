import OpenAI from "openai";

const client = new OpenAI({
  // Alibaba Cloud DashScope
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.OPENROUTER_API_KEY, 
});

export async function scoreArticle(title: string, content: string) {
  const systemPrompt = `
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
  "difficulty_level": "L1", // L1 (入门), L2 (进阶), L3 (专家)
  "is_promotional": false,
  "mentor_summary": "极简两句话总结核心价值，直击痛点，例如：本文深入解析了 Rust 异步状态机。适合有一定基础但卡在执行流控制的开发者。",
  "webhook_action": "push_discord" // >80 分返回此值，否则 "save_draft"
}

Title: ${title}
Content Preview: ${content.substring(0, 1200)}...
`;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen3.5-plus", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Title: ${title}\nContent: ${content.substring(0, 1500)}...` }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return result;
  } catch (e) {
    console.error("Alibaba Cloud AI Scoring Failed:", e);
    return { score: 0, is_promotional: true, error: "API Error" };
  }
}
