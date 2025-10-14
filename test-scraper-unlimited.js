import { testScraperUnlimited } from './scraper-unlimited.js';
import { getNewsStats } from './db.js';

console.log('🧪 Testing Unlimited Scraper...\n');

try {
  await testScraperUnlimited();

  // Show stats
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
