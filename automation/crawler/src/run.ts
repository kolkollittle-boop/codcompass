import { scoreArticle } from './ai-scorer';
import { ingestArticle } from './ingest';

async function main() {
  console.log("🚀 Starting Codcompass Crawler...");

  const mockArticle = {
    title: "Cursor vs Claude Code: 2026 Developer Review",
    content: "Comparing the latest AI coding tools for professional workflows...",
    url: "https://example.com/test-article"
  };

  try {
    console.log(`🧐 Scoring article: ${mockArticle.title}`);
    const evaluation = await scoreArticle(mockArticle.title, mockArticle.content);

    console.log(`✅ Score: ${evaluation.score}. Sending to database...`);
    
    await ingestArticle({
      ...mockArticle,
      ...evaluation
    });

    console.log("🎉 Successfully processed 1 article.");
  } catch (error) {
    console.error("❌ Execution failed:", error);
    process.exit(1);
  }
}

main();
