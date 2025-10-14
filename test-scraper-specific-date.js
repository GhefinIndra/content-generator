import puppeteer from 'puppeteer';
import { insertNews } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Test scraper with specific date (10 October 2025)
 */
async function scrapeKontanSpecificDate(day, month, year) {
  console.log(`🔍 Starting scraper for date: ${day}/${month}/${year}`);
  console.log('⚠️  This will scrape ALL articles from that date (no limit)');
  console.log('⏱️  Smart delays applied for safety\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let totalArticles = 0;
    let currentPage = 1;
    let hasMorePages = true;
    const maxPages = 5; // Limit to 5 pages for testing

    while (hasMorePages && currentPage <= maxPages) {
      const perPageValue = currentPage === 1 ? '' : (currentPage - 1) * 20;
      const url = `https://www.kontan.co.id/search/indeks?kanal=&tanggal=${day}&bulan=${month}&tahun=${year}&pos=indeks&per_page=${perPageValue}`;

      console.log(`\n📄 Scraping page ${currentPage}: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content
      try {
        await page.waitForSelector('.list-berita', { timeout: 10000 });
      } catch (error) {
        console.log(`⚠️  No articles found on page ${currentPage}`);
        break;
      }

      // Extract articles
      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('.list-berita li');
        const results = [];

        articleElements.forEach(el => {
          const linkElement = el.querySelector('a');
          const titleElement = el.querySelector('h1, h2, h3');

          if (linkElement && titleElement) {
            results.push({
              uri: linkElement.href,
              judul: titleElement.textContent.trim()
            });
          }
        });

        return results;
      });

      console.log(`   Found ${articles.length} articles on page ${currentPage}`);

      if (articles.length === 0) {
        hasMorePages = false;
        break;
      }

      totalArticles += articles.length;

      // Don't scrape content for this test, just count
      console.log(`   ℹ️  Skipping content scraping for test (just counting articles)`);

      // Simple strategy: just try next page until no articles found
      if (articles.length > 0 && currentPage < maxPages) {
        currentPage++;
        const pageDelay = 2000 + Math.random() * 1000;
        console.log(`   ⏳ Waiting ${Math.round(pageDelay/1000)}s before next page...`);
        await new Promise(resolve => setTimeout(resolve, pageDelay));
      } else {
        hasMorePages = false;
      }
    }

    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Total pages scraped: ${currentPage}`);
    console.log(`📰 Total articles found: ${totalArticles}`);
    return totalArticles;

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Test with October 10, 2025
scrapeKontanSpecificDate(10, 10, 2025)
  .then(total => {
    console.log(`\n✅ Test completed: ${total} articles found`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`\n❌ Test failed:`, error.message);
    process.exit(1);
  });
