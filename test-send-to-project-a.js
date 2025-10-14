import { sendToProjectA } from './scheduler.js';

console.log('🚀 Testing: Send Recommendations to Project A\n');

try {
  const result = await sendToProjectA();

  console.log('\n✅ Test completed!');
  console.log(`   Sent: ${result.sent} schedules`);
  console.log(`   Failed: ${result.failed} schedules`);

  if (result.sent > 0) {
    console.log(`\n🎬 Next: Go to Project A dashboard and start streaming!`);
    console.log(`   URL: http://localhost:3000/dashboard.html`);
  }

  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
