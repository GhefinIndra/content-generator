import express from 'express';
import dotenv from 'dotenv';
import { scrapeToday } from './scraper.js';
import { generateContentFromNews } from './ai-generator.js';
import { sendToProjectA, runFullWorkflow } from './scheduler.js';
import { getNewsStats, getRekomendasiStats } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static('public'));

// ========================================
// API ENDPOINTS
// ========================================

/**
 * GET / - API Info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Content Generator API (Project B)',
    version: '1.0.0',
    endpoints: {
      'GET /api/stats': 'Get statistics',
      'POST /api/scrape': 'Scrape Kontan.co.id articles',
      'POST /api/generate': 'Generate content with AI',
      'POST /api/send': 'Send to Project A',
      'POST /api/workflow': 'Run full workflow'
    }
  });
});

/**
 * GET /api/stats - Get statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const newsStats = await getNewsStats();
    const rekomendasiStats = await getRekomendasiStats();

    res.json({
      success: true,
      news: newsStats,
      rekomendasi: rekomendasiStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scrape - Scrape Kontan.co.id articles
 * Body: { maxPages, maxArticles } (optional for limited mode)
 */
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('\n📡 API: Scrape request received');
    const options = req.body || {};

    // For now, use unlimited scraper
    // TODO: Implement limited scraper with options
    const { scrapeKontanToday } = await import('./scraper-unlimited.js');

    // Run in background
    scrapeKontanToday()
      .then(count => {
        console.log(`✅ Scraping completed: ${count} articles`);
      })
      .catch(error => {
        console.error(`❌ Scraping failed: ${error.message}`);
      });

    res.json({
      success: true,
      message: 'Scraping started in background',
      options
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate - Generate content with AI
 */
app.post('/api/generate', async (req, res) => {
  try {
    console.log('\n📡 API: Generate request received');

    // Use single video per article generator
    const { generateSingleVideoPerArticle } = await import('./ai-generator-single.js');

    const recommendations = await generateSingleVideoPerArticle();

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map(r => ({
        judul: r.judul,
        hashtag: r.hashtag,
        content_length: r.konten.length
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/send - Send to Project A
 */
app.post('/api/send', async (req, res) => {
  try {
    console.log('\n📡 API: Send to Project A request received');

    // Use the new send function
    const { sendToProjectA: sendVideos } = await import('./send-to-project-a.js');

    const result = await sendVideos();

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow - Run full workflow
 */
app.post('/api/workflow', async (req, res) => {
  try {
    console.log('\n📡 API: Full workflow request received');

    // Import and run the financial workflow
    const { default: runFinancialWorkflow } = await import('./run-financial-workflow.js');

    // Run in background
    runFinancialWorkflow()
      .then(() => {
        console.log(`✅ Workflow completed successfully`);
      })
      .catch(error => {
        console.error(`❌ Workflow failed: ${error.message}`);
      });

    res.json({
      success: true,
      message: 'Workflow started in background. Check console for progress.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Content Generator Server (Project B) Started!');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET  /api/stats      - Get statistics`);
  console.log(`   POST /api/scrape     - Scrape articles`);
  console.log(`   POST /api/generate   - Generate AI content`);
  console.log(`   POST /api/send       - Send to Project A`);
  console.log(`   POST /api/workflow   - Run full workflow`);
  console.log('='.repeat(60) + '\n');
});
