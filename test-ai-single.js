import { testSingleVideoGeneration } from './ai-generator-single.js';
import { getRekomendasiStats } from './db.js';

console.log('🧪 Testing Single Video Generation (1 Article = 1 Video)...\n');

try {
  await testSingleVideoGeneration();

  // Show stats
  const stats = await getRekomendasiStats();
  console.log('\n📈 Rekomendasi Statistics:');
  stats.forEach(stat => {
    console.log(`   ${stat.status}: ${stat.total} videos`);
  });

  console.log('\n✅ Test completed successfully!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
