import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function scoreArticle(title: string, content: string) {
  const prompt = `
  你是一位资深技术编辑。请对以下技术文章进行质量评估。
  评分标准 (0-100): 
  1. 技术深度与实用性 (40%)
  2. 结构清晰度 (30%)
  3. 是否包含代码示例或实操步骤 (30%)
  扣分项: 纯广告/推销 (-50), 内容过短/碎片化 (-30), 语气过于个人化/水文 (-20)。

  请严格返回 JSON: {"score": number, "feedback": string, "is_promotional": boolean}
  
  Title: ${title}
  Content Preview: ${content.substring(0, 1000)}...
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "qwen/qwen3.5-plus", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (e) {
    console.error("AI Scoring Failed:", e);
    return { score: 0, feedback: "AI Error", is_promotional: true };
  }
}
