import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

async function testOct13() {
  console.log(`🔍 Testing scraper for October 13, 2025`);
  console.log('⚠️  Checking how many pages available\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    let currentPage = 1;
    const maxPages = 6; // Check up to 6 pages

    while (currentPage <= maxPages) {
      const perPageValue = currentPage === 1 ? '' : (currentPage - 1) * 20;
      const url = `https://www.kontan.co.id/search/indeks?kanal=&tanggal=13&bulan=10&tahun=2025&pos=indeks&per_page=${perPageValue}`;

      console.log(`📄 Checking page ${currentPage}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      try {
        await page.waitForSelector('.list-berita', { timeout: 10000 });
      } catch (error) {
        console.log(`   ❌ No content found on page ${currentPage}`);
        break;
      }

      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('.list-berita li');
        return articleElements.length;
      });

      console.log(`   ✅ Found ${articles} articles`);

      if (articles === 0) {
        console.log(`   ℹ️  Page ${currentPage} is empty, stopping`);
        break;
      }

      currentPage++;
      if (currentPage <= maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✅ Total pages with content: ${currentPage - 1}`);

  } finally {
    await browser.close();
  }
}

testOct13().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
