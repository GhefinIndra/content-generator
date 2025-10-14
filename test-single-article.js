import puppeteer from 'puppeteer';

// Test scraping single article untuk debugging
const testUrl = 'https://www.kontan.co.id/news/pasar-lesu-adira-proyeksikan-pertumbuhan-pembiayaan-baru-low-single-digit-pada-2025';

console.log('🔍 Testing single article scraping...');
console.log(`URL: ${testUrl}\n`);

const browser = await puppeteer.launch({
  headless: false, // Show browser for debugging
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log('📄 Loading page...');
  await page.goto(testUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // Wait additional time for dynamic content
  console.log('⏳ Waiting for content to load...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('✅ Page loaded!\n');

  // Debug: Get all possible selectors and ALL paragraphs
  const debug = await page.evaluate(() => {
    const results = {
      title: null,
      date: null,
      content: null,
      allClasses: new Set(),
      articleSelectors: [],
      allParagraphs: []
    };

    // Find title
    const h1 = document.querySelector('h1');
    if (h1) results.title = h1.textContent.trim();

    // Get ALL paragraphs from the page
    const allP = document.querySelectorAll('p');
    allP.forEach((p, idx) => {
      const text = p.textContent.trim();
      if (text.length > 50) {
        results.allParagraphs.push({
          index: idx,
          length: text.length,
          parent: p.parentElement?.className || 'no-class',
          text: text.substring(0, 150)
        });
      }
    });

    // Find all elements with 'content', 'article', or 'detail' in class name
    const allElements = document.querySelectorAll('[class*="content"], [class*="article"], [class*="detail"], [class*="news"], [class*="post"]');
    allElements.forEach(el => {
      el.classList.forEach(cls => results.allClasses.add(cls));

      // Check if element has paragraphs
      const paragraphs = el.querySelectorAll('p');
      if (paragraphs.length > 0) {
        results.articleSelectors.push({
          classes: Array.from(el.classList),
          paragraphCount: paragraphs.length,
          firstParagraph: paragraphs[0]?.textContent?.substring(0, 100)
        });
      }
    });

    results.allClasses = Array.from(results.allClasses);
    return results;
  });

  console.log('🔍 Debug Information:');
  console.log('Title:', debug.title);
  console.log('\n📊 All classes found:', debug.allClasses);
  console.log('\n📝 Potential article containers:', JSON.stringify(debug.articleSelectors, null, 2));
  console.log('\n📄 All paragraphs found:', debug.allParagraphs.length);
  if (debug.allParagraphs.length > 0) {
    console.log('\nFirst 3 paragraphs:');
    debug.allParagraphs.slice(0, 3).forEach(p => {
      console.log(`  - Parent: ${p.parent}, Length: ${p.length}`);
      console.log(`    "${p.text}..."\n`);
    });
  }

  // Now try to extract content
  const content = await page.evaluate(() => {
    // Try different selectors
    const selectors = [
      '.detail-content',
      '.article-content',
      '.post-content',
      'article',
      '[class*="detail"]',
      '.content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const paragraphs = element.querySelectorAll('p');
        let text = '';

        paragraphs.forEach(p => {
          const pText = p.textContent.trim();
          if (pText && pText.length > 50) {
            text += pText + '\n\n';
          }
        });

        if (text.length > 100) {
          return { selector, text, paragraphCount: paragraphs.length };
        }
      }
    }

    return null;
  });

  console.log('\n📰 Extracted Content:');
  if (content) {
    console.log(`✅ Success using selector: ${content.selector}`);
    console.log(`Paragraphs found: ${content.paragraphCount}`);
    console.log(`Content length: ${content.text.length} characters`);
    console.log(`\nFirst 500 chars:\n${content.text.substring(0, 500)}...`);
  } else {
    console.log('❌ Failed to extract content');
  }

  console.log('\n⏳ Browser will close in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await browser.close();
}
