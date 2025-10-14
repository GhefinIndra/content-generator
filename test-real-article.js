import puppeteer from 'puppeteer';
import { insertNews } from './db.js';

const testUrl = 'https://investasi.kontan.co.id/news/harga-minyak-mentah-melonjak-1-di-tengah-potensi-perundingan-dagang-as-china';

console.log('🧪 Testing real Kontan article scraping...');
console.log(`URL: ${testUrl}\n`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log('📄 Loading article...');
  await page.goto(testUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('✅ Page loaded!\n');

  // Extract content using new selectors
  const result = await page.evaluate(() => {
    // Get title
    const h1 = document.querySelector('h1');
    const title = h1 ? h1.textContent.trim() : null;

    // Kontan.co.id specific selectors
    const selectors = [
      '.img-detail-desk',
      '.box-det-desk-2',
      '.detail-content',
      '.detail-desk'
    ];

    let text = '';
    let usedSelector = null;

    for (const selector of selectors) {
      const contentElement = document.querySelector(selector);

      if (contentElement) {
        const paragraphs = contentElement.querySelectorAll('p');

        paragraphs.forEach(p => {
          const pText = p.textContent.trim();

          const isValid = pText &&
            pText.length > 50 &&
            !pText.includes('©') &&
            !pText.toLowerCase().includes('baca juga') &&
            !pText.toLowerCase().includes('sumber:') &&
            !pText.toLowerCase().includes('editor:');

          if (isValid) {
            text += pText + '\n\n';
          }
        });

        if (text.trim().length > 200) {
          usedSelector = selector;
          break;
        }
      }
    }

    return {
      title,
      content: text.trim(),
      usedSelector,
      contentLength: text.trim().length
    };
  });

  console.log('📰 Extraction Results:');
  console.log(`Title: ${result.title}`);
  console.log(`Used Selector: ${result.usedSelector}`);
  console.log(`Content Length: ${result.contentLength} characters\n`);

  if (result.content && result.contentLength > 200) {
    console.log('✅ Successfully extracted content!');
    console.log('\n📄 First 500 characters:');
    console.log(result.content.substring(0, 500) + '...\n');

    // Save to database
    console.log('💾 Saving to database...');
    await insertNews({
      uri: testUrl,
      judul: result.title,
      isi_berita: result.content,
      tanggal_berita: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });

    console.log('✅ Saved to database successfully!');
  } else {
    console.log('❌ Failed to extract sufficient content');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await browser.close();
}
