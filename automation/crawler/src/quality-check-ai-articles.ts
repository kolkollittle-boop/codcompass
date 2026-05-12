/**
 * AI 原创文章质量检查 + 优化
 * 
 * 功能：
 * 1. 查询所有 sourceSite = 'ai-generated' 的文章
 * 2. 用 AI scorer 重新真实打分
 * 3. 低于 65 分的 → 调用 AI 优化重写
 * 4. 优化后重新打分，直到 >= 65 或达到重试上限
 * 5. 更新数据库分数和质量详情
 * 
 * 使用方式：
 *   cd automation/crawler && npx tsx src/quality-check-ai-articles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const aiClient = new OpenAI({
  baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ── AI 评分 ──────────────────────────────────────────────

async function scoreArticle(title: string, content: string): Promise<{ score: number; dimensions?: any; error?: string }> {
  const systemPrompt = `Please return the result in a strict JSON format.

You are a senior technical editor (direct, outcome-focused). Score and evaluate the following technical article.
The field mentor_summary MUST be English only (two short sentences), regardless of the article language.

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
  "mentor_summary": "Two short sentences in English summarizing core value (no Chinese).",
  "webhook_action": "push_discord"
}`;

  try {
    const completion = await aiClient.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Title: ${title}\nContent: ${content.substring(0, 2000)}...` }
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw);
    return { score: parsed.score || 0, dimensions: parsed };
  } catch (e: any) {
    console.error(`  ⚠️ AI 评分失败: ${e.message}`);
    return { score: 0, error: e.message };
  }
}

// ── AI 优化文章 ──────────────────────────────────────────────

async function optimizeArticle(title: string, content: string, score: number, dimensions: any): Promise<{ title: string; content: string } | null> {
  const weaknesses: string[] = [];
  if (dimensions?.dimensions) {
    const d = dimensions.dimensions;
    if (d.practicality < 25) weaknesses.push('缺乏可运行的代码示例、排错指南、具体步骤');
    if (d.timeliness < 15) weaknesses.push('技术栈过时或非主流版本');
    if (d.uniqueness < 8) weaknesses.push('缺乏独家见解，像文档搬运');
    if (d.business < 3) weaknesses.push('对付费用户价值不够高');
  }
  if (dimensions?.is_promotional) weaknesses.push('含有营销/引流/广告内容');

  const prompt = `You are a senior technical writer. Improve this article that scored ${score}/100.

Weaknesses identified:
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w}`).join('\n') : '- General quality improvement needed'}

Requirements:
1. Add concrete, runnable code examples
2. Include troubleshooting tips
3. Use current/latest technology versions
4. Provide unique insights, not just documentation regurgitation
5. Remove any marketing/promotional content
6. Follow Codcompass 2.0 structure:
   - Current Situation Analysis
   - WOW Moment
   - Core Solution
   - Pitfall Guide
   - Production Bundle

Output ONLY the improved article content in markdown format. No preamble, no explanation.

Original title: ${title}
Original content:
${content.substring(0, 4000)}`;

  try {
    const completion = await aiClient.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [
        { role: 'system', content: 'You are a senior technical editor who writes high-quality technical articles.' },
        { role: 'user', content: prompt }
      ],
    });

    const improved = completion.choices[0].message.content;
    if (!improved || improved.length < 300) {
      console.log('  ⚠️ 优化结果太短，视为失败');
      return null;
    }

    // 提取新标题
    const titleMatch = improved.match(/^#\s+(.+)$/m);
    const newTitle = titleMatch ? titleMatch[1].trim().substring(0, 199) : title;
    const newContent = titleMatch ? improved.replace(/^#\s+.+$/m, '').trim() : improved;

    return { title: newTitle, content: newContent };
  } catch (e: any) {
    console.error(`  ⚠️ AI 优化失败: ${e.message}`);
    return null;
  }
}

// ── 生成 excerpt ──────────────────────────────────────────────

function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
  if (plainText.length <= maxLength) return plainText;
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
  );
  if (lastSentenceEnd > maxLength * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  return truncated + '...';
}

// ── 主流程 ──────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('🔍 AI 原创文章质量检查 + 优化');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('');

  // 1. 查询所有 ai-generated 文章
  const { data: aiArticles, error } = await supabase
    .from('Article')
    .select('id, titleEn, contentEn, qualityScore, qualityDetails, slug')
    .eq('sourceSite', 'ai-generated')
    .order('createdAt', { ascending: true });

  if (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }

  if (!aiArticles || aiArticles.length === 0) {
    console.log('✅ 没有找到 AI 生成的文章');
    return;
  }

  console.log(`📋 找到 ${aiArticles.length} 篇 AI 生成文章`);
  console.log('');

  let totalChecked = 0;
  let totalPassed = 0;
  let totalOptimized = 0;
  let totalFailed = 0;
  const failedList: { title: string; score: number; reason: string }[] = [];

  for (let i = 0; i < aiArticles.length; i++) {
    const article = aiArticles[i];
    const idx = i + 1;
    console.log(`[${idx}/${aiArticles.length}] ${article.titleEn?.slice(0, 80) || '无标题'}`);
    console.log(`  旧分数: ${article.qualityScore} (硬编码)`);

    // 重新评分
    const result = await scoreArticle(article.titleEn || '', article.contentEn || '');
    totalChecked++;

    if (result.error) {
      console.log(`  ❌ 评分 API 错误: ${result.error}`);
      totalFailed++;
      failedList.push({ title: article.titleEn || '无标题', score: 0, reason: '评分 API 错误' });
      continue;
    }

    console.log(`  新分数: ${result.score}`);

    if (result.score >= 65) {
      // 达标，更新真实分数
      await supabase
        .from('Article')
        .update({
          qualityScore: result.score,
          qualityDetails: {
            ...(article.qualityDetails || {}),
            ...result.dimensions,
            is_ai_generated: true,
            verified_at: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        })
        .eq('id', article.id);

      console.log(`  ✅ 达标，更新分数`);
      totalPassed++;
    } else {
      // 低于 65，尝试优化
      console.log(`  🔄 低于 65 分，尝试优化...`);

      let optimized = false;
      let currentTitle = article.titleEn || '';
      let currentContent = article.contentEn || '';
      let currentScore = result.score;
      let currentDimensions = result.dimensions;

      const MAX_RETRY = 2;
      for (let retry = 0; retry < MAX_RETRY; retry++) {
        console.log(`    优化轮次 ${retry + 1}/${MAX_RETRY} (当前分数: ${currentScore})`);

        const improved = await optimizeArticle(currentTitle, currentContent, currentScore, currentDimensions);
        if (!improved) {
          console.log(`    ❌ 优化失败`);
          continue;
        }

        // 对优化后的文章重新评分
        await new Promise(r => setTimeout(r, 2000)); // API 间隔
        const newResult = await scoreArticle(improved.title, improved.content);

        if (newResult.error) {
          console.log(`    ❌ 重新评分失败: ${newResult.error}`);
          continue;
        }

        console.log(`    优化后分数: ${newResult.score}`);

        if (newResult.score >= 65) {
          // 达标，更新文章
          await supabase
            .from('Article')
            .update({
              titleEn: improved.title,
              contentEn: improved.content,
              excerptEn: generateExcerpt(improved.content, 300),
              descriptionEn: generateExcerpt(improved.content, 300),
              qualityScore: newResult.score,
              qualityDetails: {
                ...newResult.dimensions,
                is_ai_generated: true,
                optimized: true,
                optimized_at: new Date().toISOString(),
                original_score: result.score,
              },
              updatedAt: new Date().toISOString(),
            })
            .eq('id', article.id);

          console.log(`    🎉 优化成功，已更新`);
          totalOptimized++;
          optimized = true;
          break;
        } else {
          // 仍未达标，继续用优化后的内容再优化
          currentTitle = improved.title;
          currentContent = improved.content;
          currentScore = newResult.score;
          currentDimensions = newResult.dimensions;
        }

        if (retry < MAX_RETRY - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      if (!optimized) {
        // 优化后仍未达标，更新分数但不发布（标记为 REVIEW）
        await supabase
          .from('Article')
          .update({
            status: 'REVIEW',
            qualityScore: currentScore,
            qualityDetails: {
              ...currentDimensions,
              is_ai_generated: true,
              optimization_failed: true,
              optimized_at: new Date().toISOString(),
              original_score: result.score,
            },
            updatedAt: new Date().toISOString(),
          })
          .eq('id', article.id);

        console.log(`  ❌ 优化 ${MAX_RETRY} 轮后仍低于 65 分 (${currentScore})，已回退到 REVIEW`);
        totalFailed++;
        failedList.push({ title: article.titleEn || '无标题', score: currentScore, reason: `优化 ${MAX_RETRY} 轮后仍不达标` });
      }
    }

    // API 间隔，避免限流
    if (i < aiArticles.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // 汇总报告
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 质量检查完成报告');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️  耗时: ${elapsed} 秒 (${(Number(elapsed) / 60).toFixed(1)} 分钟)`);
  console.log(`📋 AI 生成文章总数: ${aiArticles.length} 篇`);
  console.log(`✅ 首次达标 (≥65): ${totalPassed} 篇`);
  console.log(`🔄 优化后达标: ${totalOptimized} 篇`);
  console.log(`❌ 优化失败 (已回退 REVIEW): ${totalFailed} 篇`);
  if (failedList.length > 0) {
    console.log('');
    console.log('失败文章:');
    failedList.forEach(f => console.log(`  - ${f.title.slice(0, 60)} (${f.score}分, ${f.reason})`));
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 任务异常:', err);
  process.exit(1);
});
