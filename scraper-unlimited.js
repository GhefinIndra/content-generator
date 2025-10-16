import puppeteer from 'puppeteer';
import { insertNews, checkArticleExists } from './db.js';
import { toJakartaDateTime } from './utils.js';

/**
 * ENHANCED: Scrape semua artikel hari ini dengan smart delays
 * - No page limit (scrape all pages)
 * - Smart delays to avoid detection
 * - Progressive delay (makin lama makin lambat untuk keamanan)
 */
export async function scrapeKontanToday() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  console.log(`🔍 Starting UNLIMITED scraper for date: ${day}/${month}/${year}`);
  console.log('⚠️  This will scrape ALL articles from today (no limit)');
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

    while (hasMorePages) {
      // Kontan pagination uses per_page parameter:
      // Page 1: per_page= (empty)
      // Page 2: per_page=20
      // Page 3: per_page=40
      // Formula: (currentPage - 1) * 20
      const perPageValue = currentPage === 1 ? '' : (currentPage - 1) * 20;
      const url = `https://www.kontan.co.id/search/indeks?kanal=&tanggal=${day}&bulan=${month}&tahun=${year}&pos=indeks&per_page=${perPageValue}`;

      console.log(`\n📄 Scraping page ${currentPage}: ${url}`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded', // Less strict than networkidle2
        timeout: 60000 // 60 seconds timeout
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

      // Process each article
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        try {
          console.log(`   [${i + 1}/${articles.length}] 📰 ${article.judul}`);

          // Check if article already exists - SKIP if exists
          const exists = await checkArticleExists(article.uri);
          if (exists) {
            console.log(`      ⏭️  Already exists, skipped`);
            continue;
          }

          const contentPage = await browser.newPage();
          await contentPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

          await contentPage.goto(article.uri, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
          });

          // Extract content
          const content = await contentPage.evaluate(() => {
            const selectors = [
              '.img-detail-desk',
              '.box-det-desk-2',
              '.detail-content',
              '.detail-desk'
            ];

            let text = '';

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
                  break;
                }
              }
            }

            return text.trim() || null;
          });

          await contentPage.close();

          if (content && content.length > 200) {
            // Use Jakarta timezone (GMT+7)
            const tanggalBerita = toJakartaDateTime(date);

            await insertNews({
              uri: article.uri,
              judul: article.judul,
              isi_berita: content,
              tanggal_berita: tanggalBerita
            });

            totalArticles++;
            console.log(`      ✅ Saved (${content.length} chars)`);
          } else {
            console.log(`      ⚠️  Content too short, skipped`);
          }

          // SMART DELAY per artikel
          // Base: 2 detik, tambah 0.5 detik setiap 10 artikel untuk safety
          const baseDelay = 2000;
          const progressiveDelay = Math.floor(totalArticles / 10) * 500;
          const totalDelay = baseDelay + progressiveDelay;

          await new Promise(resolve => setTimeout(resolve, totalDelay));

        } catch (error) {
          console.error(`      ❌ Error: ${error.message}`);
          // Delay lebih lama kalau error (mungkin rate limited)
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Simple strategy: just try next page until no articles found
      // This is more reliable than detecting pagination buttons
      if (articles.length > 0) {
        currentPage++;
        // DELAY antar halaman: 3-5 detik (random untuk natural behavior)
        const pageDelay = 3000 + Math.random() * 2000;
        console.log(`   ⏳ Waiting ${Math.round(pageDelay/1000)}s before next page...`);
        await new Promise(resolve => setTimeout(resolve, pageDelay));
      } else {
        console.log(`   ℹ️  No more articles found, stopping pagination`);
        hasMorePages = false;
      }
    }

    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Total pages scraped: ${currentPage}`);
    console.log(`📰 Total articles saved: ${totalArticles}`);
    return totalArticles;

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Quick test function
 */
export async function testScraperUnlimited() {
  console.log('🧪 Testing UNLIMITED Scraper...\n');
  try {
    const total = await scrapeKontanToday();
    console.log(`\n✅ Test completed: ${total} articles scraped`);
    return total;
  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
    throw error;
  }
}
