import { scrapeKontanByDate } from './scraper.js';
import { getNewsStats } from './db.js';

console.log('🚀 Testing Kontan.co.id Scraper (Limited to 5 articles)...\n');

// Temporarily modify scraper to only scrape 5 articles for testing
import puppeteer from 'puppeteer';
import { insertNews } from './db.js';

async function scrapeLimited() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  console.log(`🔍 Scraping date: ${day}/${month}/${year}`);
  console.log('⚠️  Limited to 5 articles for testing\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = `https://www.kontan.co.id/search/indeks?kanal=&tanggal=${day}&bulan=${month}&tahun=${year}&pos=indeks`;
    console.log(`📄 Loading index page: ${url}\n`);

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Extract artikel dari halaman
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

    console.log(`✅ Found ${articles.length} articles on index page`);
    console.log(`🎯 Will scrape first 5 articles\n`);

    let successCount = 0;
    const articlesToScrape = articles.slice(0, 5);

    for (let i = 0; i < articlesToScrape.length; i++) {
      const article = articlesToScrape[i];

      try {
        console.log(`\n[${i + 1}/5] 📰 ${article.judul}`);
        console.log(`    URL: ${article.uri}`);

        const contentPage = await browser.newPage();
        await contentPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        await contentPage.goto(article.uri, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

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
          await insertNews({
            uri: article.uri,
            judul: article.judul,
            isi_berita: content,
            tanggal_berita: date.toISOString().slice(0, 19).replace('T', ' ')
          });

          successCount++;
          console.log(`    ✅ Saved (${content.length} chars)`);
        } else {
          console.log(`    ⚠️  Content too short or not found`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   Scraped: ${successCount}/${articlesToScrape.length} articles`);

    return successCount;

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

try {
  const total = await scrapeLimited();

  const stats = await getNewsStats();
  console.log('\n📈 Database Statistics:');
  stats.forEach(stat => {
    console.log(`   ${stat.status}: ${stat.total} articles`);
  });

  console.log('\n✅ Test completed!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
