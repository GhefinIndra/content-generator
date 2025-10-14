import puppeteer from 'puppeteer';

console.log('🔍 Simple Kontan.co.id test...\n');

const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('📄 Loading homepage...');
  await page.goto('https://www.kontan.co.id', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  console.log('✅ Homepage loaded!');

  // Wait for content
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Take screenshot
  await page.screenshot({ path: 'kontan-homepage.png', fullPage: false });
  console.log('📸 Screenshot saved: kontan-homepage.png');

  // Get page HTML
  const bodyHTML = await page.evaluate(() => {
    return {
      hasH1: document.querySelectorAll('h1').length,
      hasH2: document.querySelectorAll('h2').length,
      hasParagraphs: document.querySelectorAll('p').length,
      hasArticles: document.querySelectorAll('article').length,
      bodyText: document.body.innerText.substring(0, 500)
    };
  });

  console.log('\n📊 Page Analysis:');
  console.log('  H1 elements:', bodyHTML.hasH1);
  console.log('  H2 elements:', bodyHTML.hasH2);
  console.log('  Paragraphs:', bodyHTML.hasParagraphs);
  console.log('  Articles:', bodyHTML.hasArticles);
  console.log('\n📝 Body text preview:');
  console.log(bodyHTML.bodyText);

  console.log('\n⏳ Keeping browser open for 30 seconds for inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await browser.close();
}
