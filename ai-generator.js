import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getPendingNews, markNewsAsProcessed, insertRekomendasi } from './db.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

/**
 * Generate video content recommendations from news articles using Gemini AI
 */
export async function generateContentFromNews() {
  console.log('🤖 Starting AI Content Generation...\n');

  // Get pending news from database
  const articles = await getPendingNews();

  if (articles.length === 0) {
    console.log('⚠️  No pending articles to process');
    return [];
  }

  console.log(`📰 Found ${articles.length} pending articles\n`);

  // Prepare articles data for AI
  const articlesData = articles.map((article, idx) => ({
    id: article.id,
    judul: article.judul,
    isi: article.isi_berita,
    tanggal: article.tanggal_berita,
    uri: article.uri
  }));

  // Build comprehensive prompt
  const prompt = buildPrompt(articlesData);

  console.log('🧠 Sending to Gemini AI...');
  console.log(`📊 Input: ${articles.length} articles`);
  console.log(`📏 Prompt length: ${prompt.length} characters\n`);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ AI Response received!');
    console.log(`📏 Response length: ${text.length} characters\n`);

    // Parse AI response
    const recommendations = parseAIResponse(text, articlesData);

    console.log(`📹 Generated ${recommendations.length} video recommendations\n`);

    // Save recommendations to database
    const savedIds = [];
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];

      console.log(`💾 [${i + 1}/${recommendations.length}] Saving: "${rec.judul}"`);

      const id = await insertRekomendasi({
        judul: rec.judul,
        hashtag: rec.hashtag,
        deskripsi: rec.deskripsi,
        konten: rec.konten,
        source_news_ids: rec.source_news_ids.join(',')
      });

      savedIds.push(id);
      console.log(`   ✅ Saved with ID: ${id}`);
    }

    // Mark articles as processed
    const articleIds = articlesData.map(a => a.id);
    await markNewsAsProcessed(articleIds);

    console.log(`\n✅ Marked ${articleIds.length} articles as processed`);
    console.log(`✅ Content generation completed!\n`);

    return recommendations;

  } catch (error) {
    console.error('❌ AI Generation Error:', error.message);
    throw error;
  }
}

/**
 * Build comprehensive prompt for Gemini AI
 */
function buildPrompt(articles) {
  const articlesText = articles.map((article, idx) => {
    return `
ARTIKEL ${idx + 1}:
ID: ${article.id}
Judul: ${article.judul}
Tanggal: ${article.tanggal}
URL: ${article.uri}

Isi Berita:
${article.isi}

---
`;
  }).join('\n');

  return `Kamu adalah seorang content creator profesional yang ahli dalam menganalisis berita ekonomi, bisnis, dan finansial untuk membuat konten edukasi YouTube yang menarik dan bermanfaat.

# TUGAS KAMU:
Analisis semua artikel berita di bawah ini, lalu buatlah 3-5 video rekomendasi yang menggabungkan informasi dari beberapa artikel terkait. Setiap video harus memberikan nilai edukasi, tips praktis, analisis mendalam, dan prediksi yang dapat membantu viewer dalam pengambilan keputusan finansial atau bisnis mereka.

# ARTIKEL BERITA YANG HARUS DIANALISIS:
${articlesText}

# KRITERIA VIDEO YANG HARUS DIBUAT:

1. **Jumlah Video**: Buatlah 3-5 video. Tentukan jumlah optimal berdasarkan keterkaitan topik dan kedalaman analisis yang bisa diberikan.

2. **Target Audience**:
   - Investor & trader (pemula hingga menengah)
   - Entrepreneur & pebisnis
   - Masyarakat umum yang ingin melek finansial
   - Fresh graduate & profesional muda

3. **Gaya Penulisan**:
   - Campuran antara formal profesional dan kasual edukatif
   - Mudah dipahami oleh orang awam tapi tetap berbobot
   - Gunakan analogi sederhana untuk menjelaskan konsep kompleks
   - Sertakan data dan fakta dari artikel
   - Gunakan storytelling untuk membuat konten lebih engaging

4. **Struktur Konten Setiap Video** (500-700 kata):

   a. **Opening Hook** (50-80 kata)
      - Mulai dengan pertanyaan menarik atau fakta mengejutkan
      - Relate dengan kehidupan sehari-hari viewer
      - Teaser tentang apa yang akan dipelajari

   b. **Penjelasan Konteks** (100-150 kata)
      - Jelaskan situasi terkini berdasarkan berita
      - Background information yang diperlukan
      - Mengapa topik ini penting untuk viewer

   c. **Analisis Mendalam** (200-300 kata)
      - Breakdown informasi dari artikel
      - Hubungkan beberapa berita yang relevan
      - Jelaskan dampak dan implikasi
      - Berikan perspektif dari berbagai sudut pandang

   d. **Tips & Actionable Insights** (100-150 kata)
      - 3-5 tips praktis yang bisa langsung diterapkan
      - Dos and don'ts
      - Strategi untuk berbagai profil (konservatif, moderat, agresif)

   e. **Prediksi & Outlook** (50-100 kata)
      - Prediksi berdasarkan data dan tren
      - Skenario best case, worst case, most likely case
      - Timeline prediksi (jangka pendek: 1-7 hari, menengah: 1-3 bulan)

   f. **Call-to-Action & Closing** (30-50 kata)
      - Ajakan untuk like, subscribe, comment
      - Pertanyaan diskusi untuk comment section
      - Teaser video berikutnya

5. **Tema Video yang Direkomendasikan** (pilih yang paling relevan):
   - "Prediksi [Aset/Sektor] Berdasarkan Berita Terkini"
   - "5 Hal yang Investor Harus Tahu Hari Ini"
   - "Peluang Bisnis dari Berita Ekonomi Minggu Ini"
   - "Update Pasar: Analisis & Strategi"
   - "Belajar dari Berita: Tips Finansial Praktis"
   - Atau tema original yang lebih menarik

6. **Hashtag Strategy**:
   - 10-15 hashtag yang relevan
   - Mix antara trending, niche, dan branded hashtag
   - Contoh: #BeritaEkonomi #TipsInvestasi #AnalisaSaham #BisnisIndonesia #FinancialLiteracy

# FORMAT OUTPUT:

Berikan output dalam format JSON yang dapat di-parse dengan mudah:

\`\`\`json
{
  "videos": [
    {
      "judul": "[Judul video yang catchy dan SEO-friendly, max 80 karakter]",
      "hashtag": "#hashtag1 #hashtag2 #hashtag3 ... (10-15 hashtag)",
      "deskripsi": "[Deskripsi video 2-3 kalimat yang menarik untuk thumbnail YouTube]",
      "konten": "[Full script video 500-700 kata mengikuti struktur di atas. PISAHKAN SETIAP BAGIAN DENGAN 2 BARIS KOSONG agar mudah dijadikan slide]",
      "source_ids": [1, 3, 5],
      "reasoning": "[1-2 kalimat menjelaskan mengapa artikel-artikel ini digabungkan dan target audience video ini]"
    }
  ]
}
\`\`\`

# PENTING:
- Pastikan konten ORIGINAL, bukan copy-paste dari artikel
- Gabungkan informasi dari minimal 2-3 artikel per video
- Berikan insight dan value tambahan, bukan hanya merangkum berita
- Konten harus faktual dan data-driven
- Hindari clickbait yang menyesatkan
- Gunakan bahasa Indonesia yang baik dan benar
- KONTEN HARUS SUDAH DALAM BENTUK PARAGRAF-PARAGRAF TERPISAH dengan 2 baris kosong sebagai pemisah (untuk slide generation)

Mulai analisis dan buatlah video rekomendasi sekarang!`;
}

/**
 * Parse AI response to extract video recommendations
 */
function parseAIResponse(aiResponse, articles) {
  try {
    // Extract JSON from response (AI might wrap it in markdown)
    let jsonText = aiResponse;

    // Remove markdown code blocks if present
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    if (!parsed.videos || !Array.isArray(parsed.videos)) {
      throw new Error('Invalid response format: missing videos array');
    }

    // Validate and format each video
    const recommendations = parsed.videos.map(video => {
      // Validate required fields
      if (!video.judul || !video.konten) {
        throw new Error('Invalid video format: missing judul or konten');
      }

      return {
        judul: video.judul.trim(),
        hashtag: video.hashtag?.trim() || '',
        deskripsi: video.deskripsi?.trim() || video.judul,
        konten: video.konten.trim(),
        source_news_ids: video.source_ids || articles.map(a => a.id)
      };
    });

    return recommendations;

  } catch (error) {
    console.error('❌ Error parsing AI response:', error.message);
    console.log('\n📄 Raw AI Response:');
    console.log(aiResponse.substring(0, 1000) + '...\n');

    // Fallback: create generic recommendations
    console.log('⚠️  Using fallback: creating generic recommendation');

    return [{
      judul: 'Update Berita Ekonomi dan Bisnis Hari Ini',
      hashtag: '#BeritaEkonomi #BisnisIndonesia #UpdatePasar #Investasi #FinancialNews',
      deskripsi: 'Rangkuman berita ekonomi dan bisnis terkini beserta analisis dan tips untuk investor dan entrepreneur',
      konten: aiResponse.substring(0, 3000), // Use first 3000 chars as content
      source_news_ids: articles.map(a => a.id)
    }];
  }
}

/**
 * Test AI generation with sample articles
 */
export async function testAIGeneration() {
  console.log('🧪 Testing AI Content Generation...\n');

  try {
    const recommendations = await generateContentFromNews();

    console.log('\n📊 Test Results:');
    console.log(`   Generated: ${recommendations.length} videos`);

    recommendations.forEach((rec, idx) => {
      console.log(`\n   Video ${idx + 1}:`);
      console.log(`   - Judul: ${rec.judul}`);
      console.log(`   - Hashtag: ${rec.hashtag}`);
      console.log(`   - Content length: ${rec.konten.length} characters`);
      console.log(`   - Source articles: ${rec.source_news_ids.join(', ')}`);
    });

    return recommendations;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  }
}
