import puppeteer from 'puppeteer';
import { insertNews } from './db.js';

/**
 * Scrape artikel dari Kontan.co.id berdasarkan tanggal
 * @param {Date} date - Tanggal yang mau di-scrape (default: today)
 * @returns {Promise<number>} - Jumlah artikel yang berhasil di-scrape
 */
export async function scrapeKontanByDate(date = new Date()) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript month is 0-indexed
  const year = date.getFullYear();

  console.log(`🔍 Starting scraper for date: ${day}/${month}/${year}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set user agent untuk menghindari blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let totalArticles = 0;
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = `https://www.kontan.co.id/search/indeks?kanal=&tanggal=${day}&bulan=${month}&tahun=${year}&pos=indeks&page=${currentPage}`;

      console.log(`📄 Scraping page ${currentPage}: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Tunggu konten artikel muncul
      try {
        await page.waitForSelector('.list-berita', { timeout: 10000 });
      } catch (error) {
        console.log(`⚠️  No articles found on page ${currentPage}`);
        break;
      }

      // Extract artikel dari halaman
      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('.list-berita li');
        const results = [];

        articleElements.forEach(el => {
          const linkElement = el.querySelector('a');
          const titleElement = el.querySelector('h1, h2, h3');
          const dateElement = el.querySelector('.font-gray');

          if (linkElement && titleElement) {
            results.push({
              uri: linkElement.href,
              judul: titleElement.textContent.trim(),
              tanggal_text: dateElement ? dateElement.textContent.trim() : ''
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

      // Scrape isi berita untuk setiap artikel
      for (const article of articles) {
        try {
          console.log(`   📰 Scraping: ${article.judul}`);

          const contentPage = await browser.newPage();
          await contentPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

          await contentPage.goto(article.uri, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });

          // Extract isi berita - updated selectors based on actual Kontan structure
          const content = await contentPage.evaluate(() => {
            // Kontan.co.id specific selectors (from inspection)
            const selectors = [
              '.img-detail-desk',      // Main content container
              '.box-det-desk-2',       // Parent container
              '.detail-content',       // Alternative
              '.detail-desk',          // Alternative
              'article',               // Fallback
              '.post-content'          // Fallback
            ];

            let text = '';

            // Try each selector
            for (const selector of selectors) {
              const contentElement = document.querySelector(selector);

              if (contentElement) {
                const paragraphs = contentElement.querySelectorAll('p');

                paragraphs.forEach(p => {
                  const pText = p.textContent.trim();

                  // Filter out unwanted content
                  const isValid = pText &&
                    pText.length > 50 &&
                    !pText.includes('©') &&
                    !pText.toLowerCase().includes('baca juga') &&
                    !pText.toLowerCase().includes('cek berita') &&
                    !pText.toLowerCase().includes('selengkapnya') &&
                    !pText.toLowerCase().includes('sumber:') &&
                    !pText.toLowerCase().includes('editor:') &&
                    !pText.startsWith('KONTAN.CO.ID') && // Skip site label
                    !pText.includes('Reporter:');

                  if (isValid) {
                    text += pText + '\n\n';
                  }
                });

                // If we found content, break
                if (text.trim().length > 200) {
                  return text.trim();
                }
              }
            }

            // Last resort: get all paragraphs from body with strict filtering
            if (text.length < 200) {
              const allParagraphs = document.querySelectorAll('p');
              text = '';

              allParagraphs.forEach(p => {
                const pText = p.textContent.trim();

                const isValid = pText &&
                  pText.length > 100 &&
                  !pText.includes('©') &&
                  !pText.toLowerCase().includes('baca juga') &&
                  !pText.toLowerCase().includes('cek berita') &&
                  !pText.toLowerCase().includes('iklan') &&
                  !pText.toLowerCase().includes('advertisement');

                if (isValid) {
                  text += pText + '\n\n';
                }
              });
            }

            return text.trim() || null;
          });

          // Extract tanggal publikasi yang lebih akurat dari halaman artikel
          const publishDate = await contentPage.evaluate(() => {
            const dateElement = document.querySelector('time, .date, .font-gray');
            if (dateElement) {
              const dateStr = dateElement.getAttribute('datetime') || dateElement.textContent;
              return dateStr;
            }
            return null;
          });

          await contentPage.close();

          if (content && content.length > 100) {
            // Parse tanggal
            let tanggalBerita;
            if (publishDate) {
              tanggalBerita = new Date(publishDate);
              // Jika parsing gagal, gunakan tanggal yang di-query
              if (isNaN(tanggalBerita.getTime())) {
                tanggalBerita = date;
              }
            } else {
              tanggalBerita = date;
            }

            // Format tanggal untuk MySQL
            const tanggalBeritaFormatted = tanggalBerita.toISOString().slice(0, 19).replace('T', ' ');

            // Simpan ke database
            await insertNews({
              uri: article.uri,
              judul: article.judul,
              isi_berita: content,
              tanggal_berita: tanggalBeritaFormatted
            });

            totalArticles++;
            console.log(`   ✅ Saved to database (${content.length} chars)`);
          } else {
            console.log(`   ⚠️  Content too short or not found, skipping...`);
          }

          // Delay untuk menghindari rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`   ❌ Error scraping article: ${error.message}`);
        }
      }

      // Check apakah ada halaman berikutnya
      const hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector('.pagination .next, .pagination a[rel="next"]');
        return nextButton !== null && !nextButton.classList.contains('disabled');
      });

      if (hasNextPage && currentPage < 10) { // Limit max 10 pages untuk safety
        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay antar halaman
      } else {
        hasMorePages = false;
      }
    }

    console.log(`\n✅ Scraping completed! Total articles: ${totalArticles}`);
    return totalArticles;

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Scrape artikel hari ini
 */
export async function scrapeToday() {
  return await scrapeKontanByDate(new Date());
}
