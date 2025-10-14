import { getPendingRekomendasi, markRekomendasiAsSent, insertScheduleToProjectA } from './db.js';

/**
 * Send pending recommendations to Project A schedule table
 */
export async function sendToProjectA() {
  console.log('📤 Sending recommendations to Project A...\n');

  // Get pending recommendations
  const recommendations = await getPendingRekomendasi();

  if (recommendations.length === 0) {
    console.log('⚠️  No pending recommendations to send');
    return { sent: 0, failed: 0 };
  }

  console.log(`📹 Found ${recommendations.length} pending recommendations\n`);

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];

    try {
      console.log(`[${i + 1}/${recommendations.length}] 📤 Sending: "${rec.judul}"`);

      // Insert to Project A schedule table
      const scheduleId = await insertScheduleToProjectA({
        judul: rec.judul,
        hashtag: rec.hashtag,
        deskripsi: rec.deskripsi,
        konten: rec.konten
      });

      console.log(`   ✅ Created schedule ID: ${scheduleId} in Project A`);

      // Mark as sent in Project B
      await markRekomendasiAsSent(rec.id, scheduleId);

      console.log(`   ✅ Marked as sent in Project B\n`);

      sentCount++;

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      failedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Sent: ${sentCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);

  return { sent: sentCount, failed: failedCount };
}

/**
 * Full workflow: Generate from news and send to Project A
 */
export async function runFullWorkflow() {
  console.log('🚀 Starting Full Workflow: News → AI → Schedule → Stream\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Step 1: Check if we have pending news
    const { getPendingNews } = await import('./db.js');
    const pendingNews = await getPendingNews();

    if (pendingNews.length === 0) {
      console.log('⚠️  No pending news articles. Please run scraper first.\n');
      return false;
    }

    console.log(`📰 Step 1: Found ${pendingNews.length} pending news articles\n`);

    // Step 2: Generate content using AI
    console.log('🤖 Step 2: Generating content with Gemini AI...\n');
    const { generateContentFromNews } = await import('./ai-generator.js');
    const recommendations = await generateContentFromNews();

    console.log(`✅ Generated ${recommendations.length} video recommendations\n`);

    // Step 3: Send to Project A
    console.log('📤 Step 3: Sending to Project A schedule...\n');
    const result = await sendToProjectA();

    console.log('\n' + '=' .repeat(60));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY!\n');
    console.log(`📊 Final Summary:`);
    console.log(`   - News articles processed: ${pendingNews.length}`);
    console.log(`   - Videos generated: ${recommendations.length}`);
    console.log(`   - Schedules created in Project A: ${result.sent}`);
    console.log(`   - Failed: ${result.failed}`);

    if (result.sent > 0) {
      console.log(`\n🎬 Next Step:`);
      console.log(`   Go to Project A dashboard and start auto-loop streaming!`);
      console.log(`   URL: http://localhost:3000/dashboard.html`);
    }

    return true;

  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    throw error;
  }
}
