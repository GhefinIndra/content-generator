import { testAIGeneration } from './ai-generator.js';
import { getRekomendasiStats } from './db.js';

console.log('🚀 Testing Gemini AI Content Generator...\n');

try {
  // Generate content from pending news
  await testAIGeneration();

  // Show statistics
  const stats = await getRekomendasiStats();
  console.log('\n📈 Rekomendasi Statistics:');
  stats.forEach(stat => {
    console.log(`   ${stat.status}: ${stat.total} videos`);
  });

  console.log('\n✅ AI generation test completed!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
