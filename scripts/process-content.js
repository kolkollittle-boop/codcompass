#!/usr/bin/env node
/**
 * CPKB Content Processing Pipeline
 * Reads raw crawled content → deduplicates → AI rewrite → generates article markdown
 * 
 * Usage: node scripts/process-content.js
 * 
 * This script:
 * 1. Reads all JSON files from data/raw/
 * 2. Groups articles by topic/keyword
 * 3. Generates AI prompts for multi-source article creation
 * 4. Outputs structured article drafts to data/drafts/
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');
const DRAFTS_DIR = path.join(__dirname, '..', 'data', 'drafts');

// Ensure output directory exists
fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Read all raw JSON files
function readRawFiles() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  const allItems = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf8'));
      if (data.items) {
        allItems.push(...data.items.map(item => ({
          ...item,
          _sourceFile: file,
        })));
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }

  return allItems;
}

// Simple keyword-based topic grouping
function groupByTopic(items) {
  const topics = {};

  for (const item of items) {
    const title = (item.title || '').toLowerCase();
    let topic = 'general';

    if (title.includes('react') || title.includes('component') || title.includes('hook')) {
      topic = 'react';
    } else if (title.includes('typescript') || title.includes('type')) {
      topic = 'typescript';
    } else if (title.includes('python') || title.includes('ai') || title.includes('ml') || title.includes('machine learning')) {
      topic = 'ai-ml';
    } else if (title.includes('rust') || title.includes('async')) {
      topic = 'rust';
    } else if (title.includes('next') || title.includes('node')) {
      topic = 'javascript';
    } else if (title.includes('docker') || title.includes('deploy') || title.includes('devops')) {
      topic = 'devops';
    } else if (title.includes('security') || title.includes('auth')) {
      topic = 'security';
    }

    if (!topics[topic]) topics[topic] = [];
    topics[topic].push(item);
  }

  return topics;
}

// Generate article draft from grouped items
function generateDraft(topic, items, index) {
  if (items.length < 1) return null;

  const title = items[0].title || `Latest in ${topic}`;
  const slug = `${topic}-trending-${new Date().toISOString().split('T')[0]}`;

  const draft = {
    id: index + 1,
    slug,
    topic,
    title: `Trending in ${topic}: ${title}`,
    description: `Latest developments in ${topic.replace('-', ' ').toUpperCase()}`,
    sources: items.slice(0, 5).map(item => ({
      title: item.title,
      url: item.url || '',
      score: item.score || item.reactions || 0,
    })),
    status: 'pending_review',
    createdAt: new Date().toISOString(),
  };

  return draft;
}

// Main
function main() {
  console.log('🔄 CPKB Content Processing Pipeline');
  console.log('='.repeat(50));

  const items = readRawFiles();
  console.log(`📥 Loaded ${items.length} items from raw data`);

  const topics = groupByTopic(items);
  console.log(`📂 Found ${Object.keys(topics).length} topics`);

  const drafts = [];
  for (const [topic, topicItems] of Object.entries(topics)) {
    console.log(`  • ${topic}: ${topicItems.length} items`);

    // Sort by score/popularity
    topicItems.sort((a, b) => (b.score || b.reactions || 0) - (a.score || a.reactions || 0));

    const draft = generateDraft(topic, topicItems, drafts.length);
    if (draft) drafts.push(draft);
  }

  // Save drafts
  const outputPath = path.join(DRAFTS_DIR, `drafts-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalDrafts: drafts.length,
    drafts,
  }, null, 2));

  console.log(`\n✅ Generated ${drafts.length} article drafts`);
  console.log(`📄 Saved to ${outputPath}`);

  // Generate AI prompts for each draft
  for (const draft of drafts) {
    const promptPath = path.join(DRAFTS_DIR, `${draft.slug}-prompt.md`);
    const prompt = generateAIPrompt(draft);
    fs.writeFileSync(promptPath, prompt);
    console.log(`  📝 AI prompt: ${promptPath}`);
  }
}

function generateAIPrompt(draft) {
  const sources = draft.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url}) (score: ${s.score})`).join('\n');

  return `# AI Article Generation Prompt

## Task
Write a comprehensive technical article about: **${draft.title}**

## Sources (integrate insights from ALL of these)
${sources}

## Writing Guidelines
1. **Multi-source integration**: Combine insights from all sources, don't just summarize one
2. **Add original value**: Include your own analysis, code examples, and practical tips
3. **Structure**:
   - Hook/Introduction (why this matters)
   - Core concepts explained clearly
   - Practical code examples
   - Common mistakes to avoid
   - Pro tips / best practices
   - Conclusion with actionable next steps

4. **Tone**: Direct, professional, like a senior engineer talking to you
5. **Format**: Markdown, short paragraphs, lots of code examples
6. **Length**: 1500-2500 words
7. **Originality**: Must be substantially different from any single source

## Output Format
Return the article in this format:
- Title
- Excerpt (1-2 sentences)
- Difficulty level (Beginner/Intermediate/Advanced)
- Tags (comma-separated)
- Full article content in Markdown
`;
}

main();
