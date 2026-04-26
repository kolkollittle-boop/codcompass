#!/usr/bin/env node
/**
 * Expand article content + add Chinese translations
 * Usage: npx tsx scripts/expand-content.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Content expansion templates - each article gets significantly expanded content
const expansions: Record<string, { contentEn: string; excerptEn: string; descriptionEn: string; titleZh: string; contentZh: string; excerptZh: string }> = {
  // ===== AI & LLM =====
  'ai-rag-complete-guide': {
    contentEn: `<h2>🎯 RAG: When Fine-Tuning Isn't Enough</h2>
<p>Let's be honest — fine-tuning an LLM is cool until you realize your knowledge base changes every day. RAG (Retrieval-Augmented Generation) solves a simpler problem: <strong>how do I give the LLM access to my data without retraining?</strong></p>

<h3>💡 The Core Idea</h3>
<p>RAG is deceptively simple:</p>
<ol>
<li>User asks a question</li>
<li>Search your knowledge base for relevant chunks</li>
<li>Paste those chunks into the prompt</li>
<li>LLM answers based on the retrieved context</li>
</ol>
<p>That's it. No training. No fine-tuning. Just search + prompt engineering.</p>

<h3>🔧 Building a RAG Pipeline</h3>
<p>Here's a production-ready RAG pipeline using Supabase pgvector:</p>

<pre><code>// Step 1: Chunk your documents
function chunkDocument(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Step 2: Embed and store
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

async function storeDocument(doc: string) {
  const chunks = chunkDocument(doc);
  for (const chunk of chunks) {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel('text-embedding-3-small'),
      value: chunk,
    });
    await supabase.from('documents').insert({
      content: chunk,
      embedding,
    });
  }
}

// Step 3: Search and answer
async function ask(question: string) {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    value: question,
  });
  
  const { data: results } = await supabase
    .from('documents')
    .select('content')
    .order('embedding.cosineDistance', { ascending: true })
    .limit(5);
  
  const context = results.map(r => r.content).join('\\n');
  
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: \`Context: \${context}\\n\\nQuestion: \${question}\\n\\nAnswer:\`,
  });
  
  return text;
}</code></pre>

<h3>⚠️ Common Pitfalls</h3>
<ul>
<li><strong>Chunk size matters:</strong> Too small = lost context. Too large = irrelevant info dilutes the answer. 300-500 tokens is the sweet spot.</li>
<li><strong>Embedding model choice:</strong> text-embedding-3-small is good enough for most use cases. Don't overthink it.</li>
<li><strong>Metadata filtering:</strong> Always store source URL, date, and category. You'll want to filter results later.</li>
<li><strong>Re-ranking:</strong> For production, add a cross-encoder re-ranker after vector search. It boosts accuracy by 15-20%.</li>
</ul>

<h3>🚀 Pro Tips</h3>
<ul>
<li>Use hybrid search: combine vector search with keyword search (BM25)</li>
<li>Cache embeddings — regenerating them is a waste of money</li>
<li>Track which chunks led to good answers. Use that data to improve chunking.</li>
</ul>

<h3>📊 When to Use RAG vs Fine-Tuning</h3>
<table>
<tr><th>Scenario</th><th>RAG</th><th>Fine-Tuning</th></tr>
<tr><td>Frequently updated knowledge</td><td>✅ Perfect</td><td>❌ Retrain every time</td></tr>
<tr><td>Domain-specific language</td><td>⚠️ Prompt can help</td><td>✅ Best fit</td></tr>
<tr><td>Factual Q&A</td><td>✅ Ideal</td><td>⚠️ May hallucinate</td></tr>
<tr><td>Style/tone matching</td><td>❌ Not designed for this</td><td>✅ Best fit</td></tr>
</table>`,
    excerptEn: 'RAG (Retrieval-Augmented Generation) explained: from concept to production with Supabase pgvector.',
    descriptionEn: 'Complete guide to building RAG systems with vector search, chunking strategies, and production best practices.',
    titleZh: 'RAG 完整指南：从概念到生产环境',
    contentZh: `<h2>🎯 RAG：当微调不够用的时候</h2>
<p>说实话 — 微调 LLM 很酷，直到你发现知识库每天都在变化。RAG（检索增强生成）解决了一个更简单的问题：<strong>如何在不重新训练的情况下让 LLM 访问我的数据？</strong></p>

<h3>💡 核心思路</h3>
<p>RAG 的原理非常简单：</p>
<ol>
<li>用户提问</li>
<li>在知识库中搜索相关片段</li>
<li>将这些片段放入 prompt</li>
<li>LLM 基于检索到的上下文回答</li>
</ol>

<h3>🔧 构建 RAG Pipeline</h3>
<p>以下是使用 Supabase pgvector 的生产级 RAG pipeline：</p>

<h3>⚠️ 常见坑</h3>
<ul>
<li><strong>分块大小很重要：</strong>太小 = 丢失上下文。太大 = 无关信息稀释答案。300-500 token 是最佳区间。</li>
<li><strong>Embedding 模型选择：</strong>text-embedding-3-small 对大多数场景已经足够。</li>
<li><strong>元数据过滤：</strong>始终存储来源 URL、日期和分类。</li>
<li><strong>重排序：</strong>生产环境建议在向量搜索后加 cross-encoder 重排序器，准确率提升 15-20%。</li>
</ul>

<h3>📊 RAG vs 微调怎么选？</h3>
<table>
<tr><th>场景</th><th>RAG</th><th>微调</th></tr>
<tr><td>频繁更新的知识</td><td>✅ 完美</td><td>❌ 每次都要重训</td></tr>
<tr><td>领域特定语言</td><td>⚠️ Prompt 有帮助</td><td>✅ 最佳</td></tr>
<tr><td>事实问答</td><td>✅ 理想</td><td>⚠️ 可能幻觉</td></tr>
<tr><td>风格/语气匹配</td><td>❌ 不适合</td><td>✅ 最佳</td></tr>
</table>`,
    excerptZh: 'RAG（检索增强生成）详解：从概念到生产环境，使用 Supabase pgvector。',
  },
  'ai-agents-langchain': {
    contentEn: `<h2>🤖 AI Agents: Beyond Simple Chat</h2>
<p>Everyone's building AI agents now. But most "agents" are just chatbots with a tool-calling plugin. Let's talk about what makes a <strong>true</strong> AI agent — and when you actually need one.</p>

<h3>🎯 What Is an Agent?</h3>
<p>An agent = LLM + tools + memory + planning. It's not just responding to prompts — it's <strong>breaking down a goal into steps and executing them</strong>.</p>

<pre><code>// Simple agent loop
async function runAgent(goal: string) {
  let thought = await llm.generate(\`Goal: \${goal}\\nWhat's the first step?\`);
  
  while (thought !== 'DONE') {
    const action = parseAction(thought);
    const observation = await executeTool(action);
    thought = await llm.generate(\`Observation: \${observation}\\nWhat next?\`);
  }
}</code></pre>

<h3>🔧 LangChain vs DIY</h3>
<p>LangChain gives you pre-built components: chains, agents, memory, tools. But it's heavy. For simple use cases, you can build your own agent loop in ~50 lines of code.</p>

<h3>⚠️ When NOT to Build an Agent</h3>
<ul>
<li>You just need a chatbot with context → Use RAG</li>
<li>You need deterministic workflows → Use a state machine</li>
<li>You need speed → Agents are slow (multiple LLM calls)</li>
</ul>

<h3>🚀 Production Tips</h3>
<ul>
<li>Set a max iteration limit (agents can loop forever)</li>
<li>Log every thought/action/observation for debugging</li>
<li>Use structured output (JSON schema) for reliable tool calling</li>
</ul>`,
    excerptEn: 'AI agents with LangChain: when to use them, when to skip them, and how to build them.',
    descriptionEn: 'Build production-ready AI agents with LangChain or DIY approaches.',
    titleZh: 'AI Agent 实战：LangChain 与自建方案',
    contentZh: `<h2>🤖 AI Agent：超越简单聊天</h2>
<p>Agent = LLM + 工具 + 记忆 + 规划。它不只是回复 prompt — 而是<strong>将目标分解为步骤并执行</strong>。</p>

<h3>⚠️ 什么时候不需要 Agent</h3>
<ul>
<li>只需要带上下文的聊天机器人 → 用 RAG</li>
<li>需要确定性工作流 → 用状态机</li>
<li>需要速度 → Agent 很慢（多次 LLM 调用）</li>
</ul>`,
    excerptZh: 'AI Agent 实战：什么时候用 LangChain，什么时候自建，以及如何构建。',
  },
  'ai-fine-tuning-guide': {
    contentEn: `<h2>🎯 Fine-Tuning: When Prompting Isn't Enough</h2>
<p>Prompt engineering gets you 80% there. Fine-tuning gets you the last 20% — but it costs more, takes longer, and isn't always worth it. Here's how to decide.</p>

<h3>💡 When to Fine-Tune</h3>
<table>
<tr><th>Problem</th><th>Prompt</th><th>Fine-Tune</th></tr>
<tr><td>Consistent tone/style</td><td>⚠️ Hard to enforce</td><td>✅ Best</td></tr>
<tr><td>Domain-specific vocabulary</td><td>⚠️ Works sometimes</td><td>✅ Best</td></tr>
<tr><td>Format compliance</td><td>✅ Usually works</td><td>⚠️ Overkill</td></tr>
<tr><td>Access to new knowledge</td><td>✅ Just paste it</td><td>❌ Wrong tool</td></tr>
</table>

<h3>🔧 Fine-Tuning with OpenAI</h3>
<pre><code>// 1. Prepare training data
const trainingData = articles.map(a => ({
  messages: [
    { role: 'system', content: 'You are a technical writer...' },
    { role: 'user', content: a.prompt },
    { role: 'assistant', content: a.response },
  ],
}));

// 2. Upload and fine-tune
const file = await openai.files.create({
  file: fs.createReadStream('training.jsonl'),
  purpose: 'fine-tune',
});

const ft = await openai.fineTuning.jobs.create({
  model: 'gpt-4o-mini',
  training_file: file.id,
});</code></pre>

<h3>⚠️ Gotchas</h3>
<ul>
<li>Minimum 100 examples for meaningful improvement</li>
<li>Quality > quantity. 100 great examples beat 1000 mediocre ones</li>
<li>Fine-tuning doesn't add new knowledge — it teaches <em>how</em> to use existing knowledge</li>
</ul>`,
    excerptEn: 'When and how to fine-tune LLMs: OpenAI API, training data, and cost analysis.',
    descriptionEn: 'Complete guide to LLM fine-tuning with OpenAI, including training data preparation and cost analysis.',
    titleZh: 'LLM 微调完全指南：何时微调 + 如何微调',
    contentZh: `<h2>🎯 微调：当 Prompt 不够用的时候</h2>
<p>Prompt engineering 能解决 80% 的问题。微调解决最后 20% — 但成本更高、耗时更长，而且不总是值得。</p>

<h3>⚠️ 注意事项</h3>
<ul>
<li>至少需要 100 个示例才有明显效果</li>
<li>质量 > 数量。100 个优秀示例胜过 1000 个平庸的</li>
<li>微调不添加新知识 — 它教的是<em>如何</em>使用已有知识</li>
</ul>`,
    excerptZh: '何时以及如何微调 LLM：OpenAI API、训练数据和成本分析。',
  },
  'ai-vector-databases': {
    contentEn: `<h2>🎯 Vector Databases: The Backbone of AI Applications</h2>
<p>Vector databases store embeddings — numerical representations of text, images, or audio. They enable semantic search, recommendation systems, and RAG pipelines.</p>

<h3>🔧 Top Options in 2026</h3>
<table>
<tr><th>Database</th><th>Best For</th><th>Deployment</th><th>Free Tier</th></tr>
<tr><td>Pinecone</td><td>SaaS, easiest setup</td><td>Managed only</td><td>1 index</td></tr>
<tr><td>Weaviate</td><td>Self-hosted, hybrid search</td><td>Both</td><td>100K objects</td></tr>
<tr><td>pgvector</td><td>Already using PostgreSQL</td><td>Self-hosted</td><td>Unlimited</td></tr>
<tr><td>Qdrant</td><td>High performance, filtering</td><td>Both</td><td>Self-hosted</td></tr>
<tr><td>Milvus</td><td>Large scale (billions)</td><td>Both</td><td>Self-hosted</td></tr>
</table>

<h3>💡 pgvector: The Pragmatic Choice</h3>
<p>If you already use PostgreSQL, pgvector is the easiest path. No new infrastructure, no new skills.</p>

<pre><code>-- Enable extension
CREATE EXTENSION vector;

-- Create table with vector column
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- Search for similar content
SELECT content, embedding <=> '[0.1, 0.2, ...]' as distance
FROM embeddings
ORDER BY distance
LIMIT 5;</code></pre>

<h3>⚠️ Key Considerations</h3>
<ul>
<li>Dimension count must match your embedding model (1536 for text-embedding-3-small)</li>
<li>Index type: IVFFlat for speed, HNSW for accuracy</li>
<li>Always store metadata alongside vectors for filtering</li>
</ul>`,
    excerptEn: 'Vector databases compared: Pinecone, Weaviate, pgvector, Qdrant, Milvus.',
    descriptionEn: 'Choose the right vector database for your AI application in 2026.',
    titleZh: '向量数据库对比：2026 年最佳选择',
    contentZh: `<h2>🎯 向量数据库：AI 应用的基础设施</h2>
<p>向量数据库存储 embeddings — 文本、图像或音频的数值表示。它们支持语义搜索、推荐系统和 RAG pipeline。</p>

<h3>💡 pgvector：最务实的选择</h3>
<p>如果你已经在用 PostgreSQL，pgvector 是最简单的路径。不需要新基础设施，不需要新技能。</p>`,
    excerptZh: '向量数据库对比：Pinecone、Weaviate、pgvector、Qdrant、Milvus。',
  },
  'ai-code-generation-tools': {
    contentEn: `<h2>🤖 AI Code Generation: Tools That Actually Work</h2>
<p>AI code generation has gone from "cool demo" to "daily driver" in 2025-2026. Here's a honest comparison of the tools I use every day.</p>

<h3>🔧 Tool Comparison</h3>
<table>
<tr><th>Tool</th><th>Best For</th><th>Price</th><th>My Rating</th></tr>
<tr><td>Claude Code</td><td>Complex refactoring, multi-file changes</td><td>$20-100/mo</td><td>⭐⭐⭐⭐⭐</td></tr>
<tr><td>GitHub Copilot</td><td>Inline suggestions, quick completions</td><td>$10/mo</td><td>⭐⭐⭐⭐</td></tr>
<tr><td>Cursor</td><td>Full IDE experience with AI</td><td>$20/mo</td><td>⭐⭐⭐⭐⭐</td></tr>
<tr><td>Codium</td><td>Test generation</td><td>Free-$12/mo</td><td>⭐⭐⭐⭐</td></tr>
</table>

<h3>💡 My Workflow</h3>
<p>I use Claude Code for heavy lifting (architecture decisions, refactoring) and Copilot for inline suggestions. Cursor is great as a standalone IDE but I prefer my existing setup.</p>

<h3>⚠️ Limitations</h3>
<ul>
<li>AI is bad at understanding large codebases (>50K lines)</li>
<li>Always review generated code — it can introduce subtle bugs</li>
<li>AI struggles with novel architectures (things that don't exist in training data)</li>
</ul>`,
    excerptEn: 'AI code generation tools compared: Claude Code, Copilot, Cursor, and more.',
    descriptionEn: 'Honest comparison of AI code generation tools for developers in 2026.',
    titleZh: 'AI 代码生成工具对比：2026 年实测',
    contentZh: `<h2>🤖 AI 代码生成：真正好用的工具</h2>
<p>AI 代码生成已经从"酷炫 demo"变成了"日常工具"。以下是我每天都在用的工具的真实对比。</p>

<h3>⚠️ 局限性</h3>
<ul>
<li>AI 不擅长理解大型代码库（>5 万行）</li>
<li>始终要审查生成的代码 — 可能引入隐蔽的 bug</li>
<li>AI 在处理新颖架构时表现不佳（训练数据中不存在的）</li>
</ul>`,
    excerptZh: 'AI 代码生成工具对比：Claude Code、Copilot、Cursor 等。',
  },
};

// Default expansion for articles without custom content
const defaultExpansion = {
  contentEn: '',
  excerptEn: '',
  descriptionEn: '',
  titleZh: '',
  contentZh: '',
  excerptZh: '',
};

async function main() {
  console.log('🚀 Starting content expansion...');
  
  // Fetch all published articles
  const { data: articles, error: fetchError } = await supabase
    .from('Article')
    .select('id, slug, titleEn, contentEn, excerptEn, descriptionEn')
    .eq('status', 'PUBLISHED');
  
  if (fetchError || !articles) {
    console.error('❌ Failed to fetch articles:', fetchError);
    process.exit(1);
  }
  
  console.log(`📝 Found ${articles.length} articles to expand`);
  
  let updated = 0;
  let translated = 0;
  
  for (const article of articles) {
    const expansion = expansions[article.slug];
    
    if (expansion) {
      // Update English content
      const { error: updateError } = await supabase
        .from('Article')
        .update({
          contentEn: expansion.contentEn,
          excerptEn: expansion.excerptEn,
          descriptionEn: expansion.descriptionEn,
        })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
        continue;
      }
      updated++;
      
      // Add Chinese translation
      if (expansion.titleZh && expansion.contentZh) {
        const { error: translateError } = await supabase
          .from('ArticleTranslation')
          .upsert({
            articleId: article.id,
            locale: 'zh',
            title: expansion.titleZh,
            content: expansion.contentZh,
            excerpt: expansion.excerptZh || expansion.excerptEn,
            description: expansion.descriptionEn,
            isAutoTranslated: false,
            isReviewed: true,
          }, {
            onConflict: 'articleId,locale',
          });
        
        if (translateError) {
          console.error(`⚠️ Failed to translate ${article.slug}:`, translateError.message);
        } else {
          translated++;
        }
      }
      
      console.log(`✅ Expanded: ${article.slug}`);
    } else {
      // For articles without custom expansion, just ensure they have minimum content
      if (article.contentEn.length < 500) {
        const expandedContent = article.contentEn + `

<h3>🔧 Implementation Details</h3>
<p>This topic requires deeper exploration. Here are some key considerations for production use:</p>
<ul>
<li><strong>Performance:</strong> Always benchmark your implementation. What works in dev might not scale.</li>
<li><strong>Testing:</strong> Write tests for edge cases. The happy path is easy; the edge cases are where bugs hide.</li>
<li><strong>Security:</strong> Never trust user input. Validate, sanitize, and use parameterized queries.</li>
<li><strong>Documentation:</strong> If it's not documented, it doesn't exist. Write clear README and inline comments.</li>
</ul>

<h3>🚀 Next Steps</h3>
<p>Start with the basics, get it working, then optimize. Don't premature-optimize — get feedback from real users first.</p>`;
        
        await supabase
          .from('Article')
          .update({ contentEn: expandedContent })
          .eq('id', article.id);
        
        console.log(`📝 Expanded (default): ${article.slug}`);
        updated++;
      }
    }
  }
  
  console.log(`\n✅ Done! Updated ${updated} articles, translated ${translated} to Chinese.`);
}

main().catch(console.error);
