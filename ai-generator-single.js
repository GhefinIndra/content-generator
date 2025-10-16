import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getNewsWithoutVideo, markNewsAsProcessed, insertRekomendasi } from './db.js';
import { filterFinancialArticles, getFilterStats } from './keyword-filter.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

/**
 * NEW: Generate 1 video per article (filtered by financial keywords)
 * SKIP articles yang sudah punya video untuk prevent duplicate
 */
export async function generateSingleVideoPerArticle() {
  console.log('🤖 Starting AI Content Generation (1 Article = 1 Video)...\n');

  // Get articles yang BELUM punya video (prevent duplicate)
  const allArticles = await getNewsWithoutVideo();

  if (allArticles.length === 0) {
    console.log('⚠️  No new articles to process (all articles already have videos)');
    return [];
  }

  console.log(`📰 Found ${allArticles.length} articles without videos\n`);

  // Filter by financial keywords
  console.log('🔍 Filtering by financial keywords...');
  const filteredArticles = filterFinancialArticles(allArticles, false);

  console.log(`✅ Matched ${filteredArticles.length} financial articles\n`);

  // Show stats
  const stats = getFilterStats(allArticles);
  console.log('📊 Filter Statistics:');
  console.log(`   Total articles: ${stats.total_articles}`);
  console.log(`   Matched: ${stats.matched_articles} (${stats.match_rate})`);
  console.log('   Categories:', stats.categories);
  console.log('');

  if (filteredArticles.length === 0) {
    console.log('⚠️  No financial articles found matching keywords');
    return [];
  }

  // Generate video for EACH filtered article
  const recommendations = [];
  const processedIds = [];

  for (let i = 0; i < filteredArticles.length; i++) {
    const article = filteredArticles[i];

    console.log(`\n[${i + 1}/${filteredArticles.length}] 🎬 Generating video for:`);
    console.log(`   Title: ${article.judul}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   Keywords: ${article.matched_keywords.join(', ')}`);

    try {
      const videoContent = await generateSingleVideo(article);

      if (videoContent) {
        // Save to database
        const id = await insertRekomendasi({
          judul: videoContent.judul,
          hashtag: videoContent.hashtag,
          deskripsi: videoContent.deskripsi,
          konten: videoContent.konten,
          source_news_ids: article.id.toString()
        });

        recommendations.push({ id, ...videoContent });
        processedIds.push(article.id);

        console.log(`   ✅ Video generated and saved (ID: ${id})`);
        console.log(`   📏 Content length: ${videoContent.konten.length} chars`);
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }

    // Small delay between AI requests
    if (i < filteredArticles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Mark articles as processed
  if (processedIds.length > 0) {
    await markNewsAsProcessed(processedIds);
    console.log(`\n✅ Marked ${processedIds.length} articles as processed`);
  }

  console.log(`\n✅ Content generation completed!`);
  console.log(`📹 Total videos generated: ${recommendations.length}\n`);

  return recommendations;
}

/**
 * Generate single video from single article
 */
async function generateSingleVideo(article) {
  const prompt = buildSingleVideoPrompt(article);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse and clean response
    const parsed = parseSingleVideoResponse(text, article);

    return parsed;

  } catch (error) {
    console.error(`   ❌ AI Error: ${error.message}`);
    return null;
  }
}

/**
 * Build prompt for single article → single video
 */
function buildSingleVideoPrompt(article) {
  return `Kamu adalah analis finansial profesional yang membuat konten edukasi YouTube singkat dan powerful.

# ARTIKEL SUMBER:
Judul: ${article.judul}
URL: ${article.uri}
Tanggal: ${article.tanggal_berita}
Kategori: ${article.category}

Isi Artikel:
${article.isi_berita}

# TUGAS:
Buatlah 1 video singkat (300-800 kata) yang memberikan INSIGHT MENDALAM dan ACTIONABLE dari artikel ini.

# TARGET AUDIENCE:
- Investor & trader (pemula - menengah)
- Entrepreneur & pebisnis
- Masyarakat yang ingin melek finansial

# STRUKTUR VIDEO (WAJIB):

1. HOOK (50-80 kata)
   - Mulai dengan FAKTA MENGEJUTKAN atau ANGKA PENTING dari artikel
   - Buat penasaran dan relate dengan kehidupan sehari-hari
   - Contoh: "Dolar AS naik 2% dalam sehari. Apa artinya untuk kantong kita?"

2. KONTEKS & ANALISIS (150-250 kata)
   - Jelaskan APA yang terjadi berdasarkan artikel
   - Jelaskan MENGAPA ini terjadi (faktor penyebab)
   - Jelaskan DAMPAK ke berbagai pihak (investor, trader, masyarakat, bisnis)
   - Gunakan data dan angka dari artikel

3. PREDIKSI H+7 (100-200 kata)
   - Prediksi KEMANA ARAH pergerakan dalam 7 hari ke depan
   - Berikan 3 SKENARIO:
     * Best case (optimis)
     * Most likely (realistis)
     * Worst case (pesimis)
   - Gunakan logika dan data untuk support prediksi

4. ACTIONABLE TIPS (80-150 kata)
   - 3-5 TIPS PRAKTIS yang bisa langsung diterapkan
   - Berbeda untuk profil berbeda (konservatif, moderat, agresif)
   - Yang bisa dilakukan HARI INI atau MINGGU INI

5. CLOSING (30-50 kata)
   - Ringkasan singkat key takeaway
   - Call to action (like, subscribe, comment)

# GAYA PENULISAN:
- Bahasa Indonesia formal tapi tidak kaku
- Hindari jargon yang terlalu teknis (atau jelaskan kalau pakai)
- Gunakan analogi sederhana untuk konsep kompleks
- To the point, tidak bertele-tele
- Fokus pada INSIGHT, bukan hanya merangkum berita

# FORMAT OUTPUT (JSON):
\`\`\`json
{
  "judul": "[Judul video catchy, SEO-friendly, 60-80 karakter. Contoh: 'Dolar Naik 2%: Prediksi 7 Hari & Strategi Investor']",
  "hashtag": "#USD #Dolar #Forex #Investasi #TipsFinansial #AnalisaMarket #Rupiah #EkonomiGlobal #FinancialNews #BeritaEkonomi",
  "deskripsi": "[2-3 kalimat deskripsi menarik untuk YouTube description. Jelaskan apa yang akan dipelajari viewer]",
  "konten": "[Full script 300-800 kata. PLAIN TEXT ONLY - NO MARKDOWN, NO **, NO #, NO EMOJI di konten. Pisahkan paragraf dengan 2 baris kosong untuk slide generation]"
}
\`\`\`

# ATURAN PENTING:
1. KONTEN harus PLAIN TEXT - tidak boleh ada:
   - ** untuk bold
   - # untuk heading
   - Emoji di dalam konten
   - Formatting markdown apapun
2. Gunakan ENTER 2x (double newline) untuk pisah paragraf/section
3. Judul video harus CATCHY dan include angka/data penting
4. Hashtag: 10-15 hashtag relevan (di field hashtag saja, tidak di konten)
5. Deskripsi: Fokus pada VALUE yang didapat viewer
6. Konten: INSIGHT > Summary. Berikan perspektif unik!
7. Prediksi harus REALISTIS dan based on data, bukan spekulasi kosong
8. Tips harus ACTIONABLE - bisa dilakukan hari ini/minggu ini

Buatlah video sekarang!`;
}

/**
 * Parse AI response and clean formatting
 */
function parseSingleVideoResponse(aiResponse, article) {
  try {
    // Extract JSON
    let jsonText = aiResponse;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonText);

    // Clean content - remove ALL markdown formatting
    let cleanContent = parsed.konten || '';

    // Remove markdown bold
    cleanContent = cleanContent.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleanContent = cleanContent.replace(/\*([^*]+)\*/g, '$1');

    // Remove markdown headers
    cleanContent = cleanContent.replace(/^#+\s+/gm, '');

    // Remove inline hashtags
    cleanContent = cleanContent.replace(/#\w+/g, '');

    // Remove emoji (optional - keep common punctuation)
    // cleanContent = cleanContent.replace(/[\u{1F600}-\u{1F64F}]/gu, '');

    // Clean up multiple spaces
    cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

    // Ensure proper paragraph spacing (double newline)
    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');

    return {
      judul: parsed.judul?.trim() || article.judul,
      hashtag: parsed.hashtag?.trim() || '#BeritaEkonomi #FinancialNews',
      deskripsi: parsed.deskripsi?.trim() || article.judul,
      konten: cleanContent
    };

  } catch (error) {
    console.error('   ⚠️  Parse error, using fallback');

    // Fallback: clean the raw response
    let cleanContent = aiResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/#\w+/g, '')
      .trim();

    return {
      judul: article.judul.substring(0, 80),
      hashtag: `#${article.category} #BeritaEkonomi #FinancialNews`,
      deskripsi: article.judul,
      konten: cleanContent.substring(0, 3000)
    };
  }
}

/**
 * Test function
 */
export async function testSingleVideoGeneration() {
  console.log('🧪 Testing Single Video Generation...\n');

  try {
    const recommendations = await generateSingleVideoPerArticle();

    console.log('\n📊 Test Results:');
    console.log(`   Videos generated: ${recommendations.length}`);

    recommendations.slice(0, 3).forEach((rec, idx) => {
      console.log(`\n   Video ${idx + 1}:`);
      console.log(`   - Judul: ${rec.judul}`);
      console.log(`   - Content: ${rec.konten.length} chars`);
      console.log(`   - Preview: "${rec.konten.substring(0, 100)}..."`);
    });

    return recommendations;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  }
}
