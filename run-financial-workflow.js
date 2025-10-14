import { scrapeKontanToday } from './scraper-unlimited.js';
import { generateSingleVideoPerArticle } from './ai-generator-single.js';
import { sendToProjectA } from './scheduler.js';
import { getNewsStats, getRekomendasiStats } from './db.js';

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       📰 FINANCIAL CONTENT GENERATOR WORKFLOW 💰          ║
║                                                            ║
║   Scrape → Filter → Generate (1:1) → Send → Stream        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

async function runFinancialWorkflow() {
  const startTime = Date.now();

  try {
    // ========================================
    // STEP 1: SCRAPE ALL ARTICLES TODAY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📰 STEP 1: SCRAPING KONTAN.CO.ID');
    console.log('='.repeat(60));
    console.log('Target: ALL articles from today');
    console.log('Delays: Smart progressive delays for safety\n');

    const totalScraped = await scrapeKontanToday();

    console.log(`\n✅ Step 1 Complete: ${totalScraped} articles scraped`);

    if (totalScraped === 0) {
      console.log('\n⚠️  No articles scraped. Workflow stopped.');
      return false;
    }

    // ========================================
    // STEP 2: FILTER & GENERATE (1 ARTICLE = 1 VIDEO)
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🤖 STEP 2: AI CONTENT GENERATION');
    console.log('='.repeat(60));
    console.log('Strategy: 1 Article = 1 Video');
    console.log('Filter: Financial keywords (USD, Forex, Gold, Stock, etc.)');
    console.log('Output: Clean format (no markdown, no formatting)\n');

    const recommendations = await generateSingleVideoPerArticle();

    console.log(`\n✅ Step 2 Complete: ${recommendations.length} videos generated`);

    if (recommendations.length === 0) {
      console.log('\n⚠️  No videos generated (no matching articles). Workflow stopped.');
      return false;
    }

    // ========================================
    // STEP 3: SEND TO PROJECT A
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📤 STEP 3: SENDING TO PROJECT A (YouTube Queue)');
    console.log('='.repeat(60) + '\n');

    const sendResult = await sendToProjectA();

    console.log(`\n✅ Step 3 Complete: ${sendResult.sent} schedules created`);

    if (sendResult.failed > 0) {
      console.log(`⚠️  ${sendResult.failed} schedules failed to send`);
    }

    // ========================================
    // FINAL SUMMARY
    // ========================================
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '='.repeat(60));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Final Summary:`);
    console.log(`   ⏱️  Total time: ${duration} seconds (~${Math.round(duration/60)} minutes)`);
    console.log(`   📰 Articles scraped: ${totalScraped}`);
    console.log(`   🎬 Videos generated: ${recommendations.length}`);
    console.log(`   📤 Schedules sent to Project A: ${sendResult.sent}`);
    console.log(`   ❌ Failed: ${sendResult.failed}`);

    // Show statistics
    const newsStats = await getNewsStats();
    const rekomStats = await getRekomendasiStats();

    console.log(`\n📈 Database Statistics:`);
    console.log(`   News articles:`);
    newsStats.forEach(stat => {
      console.log(`     - ${stat.status}: ${stat.total}`);
    });
    console.log(`   Recommendations:`);
    rekomStats.forEach(stat => {
      console.log(`     - ${stat.status}: ${stat.total}`);
    });

    // Next steps
    if (sendResult.sent > 0) {
      console.log(`\n🎬 Next Steps:`);
      console.log(`   1. Go to Project A:`);
      console.log(`      cd C:\\infomedia\\yt-stream-node`);
      console.log(`      npm start`);
      console.log(`\n   2. Open dashboard:`);
      console.log(`      http://localhost:3000/dashboard.html`);
      console.log(`\n   3. Click "Start Auto-Loop"`);
      console.log(`\n   4. Your ${sendResult.sent} financial videos will stream automatically! 🚀`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL DONE! Happy streaming! 🎬💰');
    console.log('='.repeat(60) + '\n');

    return true;

  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    console.error(error.stack);

    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Check database connection (ai.umkdigital.id)');
    console.log('3. Check Gemini API key validity');
    console.log('4. Check Kontan.co.id accessibility\n');

    console.log('💡 Try running steps individually:');
    console.log('   node test-scraper-unlimited.js    # Test scraper');
    console.log('   node test-ai-single.js            # Test AI generator');
    console.log('   node test-send-to-project-a.js    # Test integration\n');

    return false;
  }
}

// Export for use in server
export default runFinancialWorkflow;

// Run workflow if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runFinancialWorkflow()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
