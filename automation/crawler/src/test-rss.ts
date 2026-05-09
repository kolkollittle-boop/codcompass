/**
 * 测试 RSS 爬虫
 */
import { fetchMultipleRssSources, PREMIUM_RSS_SOURCES } from '../src/rss-crawler';

async function main() {
  console.log('🧪 测试 RSS 爬虫...\n');
  
  // 只测试前两个源
  const testSources = PREMIUM_RSS_SOURCES.slice(0, 2);
  
  const articles = await fetchMultipleRssSources(testSources);
  
  console.log(`\n📊 共获取 ${articles.length} 篇文章`);
  
  if (articles.length > 0) {
    console.log('\n前 5 篇文章:');
    articles.slice(0, 5).forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title.substring(0, 80)}...`);
      console.log(`     URL: ${a.url.substring(0, 80)}...`);
      console.log(`     Tags: ${a.tags.join(', ') || 'none'}`);
      console.log('');
    });
  }
}

main().catch(console.error);
