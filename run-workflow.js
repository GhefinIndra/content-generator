import { runFullWorkflow } from './scheduler.js';

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          📰 CONTENT GENERATOR - FULL WORKFLOW 🤖          ║
║                                                            ║
║  News Scraping → AI Generation → Project A Integration    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

try {
  const success = await runFullWorkflow();

  if (success) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    ✅ SUCCESS!                            ║
╚════════════════════════════════════════════════════════════╝

🎬 Next Step: Start Streaming in Project A

1. Open terminal dan jalankan:
   cd C:\\infomedia\\yt-stream-node
   npm start

2. Buka browser:
   http://localhost:3000/dashboard.html

3. Klik button:
   "Start Auto-Loop"

4. Enjoy your automated YouTube Live streaming! 🚀
`);
  }

  process.exit(0);

} catch (error) {
  console.error('\n❌ Workflow failed:', error.message);
  console.error('\nPlease check:');
  console.error('1. Internet connection');
  console.error('2. Database connection');
  console.error('3. Gemini API key validity');
  console.error('4. Run individual tests to debug:\n');
  console.error('   node test-scraper-limited.js');
  console.error('   node test-ai-generator.js');
  console.error('   node test-send-to-project-a.js\n');
  process.exit(1);
}
