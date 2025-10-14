import { scrapeToday } from './scraper.js';
import { getNewsStats } from './db.js';

console.log('🚀 Starting Kontan.co.id Scraper Test...\n');

try {
  // Scrape artikel hari ini
  const totalArticles = await scrapeToday();

  console.log('\n📊 Scraping Results:');
  console.log(`   Total articles scraped: ${totalArticles}`);

  // Show statistics
  const stats = await getNewsStats();
  console.log('\n📈 Database Statistics:');
  stats.forEach(stat => {
    console.log(`   ${stat.status}: ${stat.total} articles`);
  });

  console.log('\n✅ Test completed successfully!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
