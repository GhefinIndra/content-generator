# 📰 Content Generator (Project B)

**Automated news scraping and AI-powered video content generation system**

---

## 🎯 Overview

Project B adalah sistem otomatis yang:
1. **Scrape** artikel berita dari Kontan.co.id
2. **Analyze** dengan Gemini AI untuk generate konten video edukatif
3. **Send** ke Project A untuk auto-streaming ke YouTube

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Kontan.co.id   │
│  (News Source)  │
└────────┬────────┘
         │ Scraping (Puppeteer)
         ▼
┌─────────────────┐
│   Database      │
│  content_gen    │
│   (Table: news) │
└────────┬────────┘
         │
         │ AI Processing (Gemini)
         ▼
┌─────────────────┐
│   Database      │
│  (rekomendasi)  │
└────────┬────────┘
         │
         │ Integration
         ▼
┌─────────────────┐
│   Project A     │
│   (schedule)    │
│  → YouTube Live │
└─────────────────┘
```

---

## 📦 Installation

### 1. Install Dependencies
```bash
cd C:\infomedia\content-generator
npm install
```

### 2. Setup Environment
File `.env` sudah ada dengan konfigurasi:
```env
# Database
DB_HOST=ai.umkdigital.id
DB_PORT=3306
DB_USER=ai
DB_PASSWORD=DigitalSales@2025
DB_NAME_PROJECT_B=content_generator
DB_NAME_PROJECT_A=schedule_stream

# Gemini AI
GEMINI_API_KEY=AIzaSyBMk8OJXgs9xe9RT6Cl83hXRzauCzySDrE
GEMINI_MODEL=gemini-2.5-flash

# Server
PORT=4000
```

### 3. Setup Database
Database `content_generator` sudah dibuat dengan 2 tabel:
- `news` - Menyimpan artikel hasil scraping
- `rekomendasi` - Menyimpan video hasil AI generation

---

## 🚀 Usage

### **Method 1: Manual Step-by-Step**

#### Step 1: Scrape Articles
```bash
npm run scrape
```
Atau untuk test (5 artikel saja):
```bash
node test-scraper-limited.js
```

#### Step 2: Generate AI Content
```bash
node test-ai-generator.js
```

#### Step 3: Send to Project A
```bash
node test-send-to-project-a.js
```

---

### **Method 2: Full Workflow (Recommended)**

Run semua step sekaligus:
```bash
node run-workflow.js
```

---

### **Method 3: API Server**

Start server:
```bash
npm start
```

Server akan berjalan di `http://localhost:4000`

#### API Endpoints:

**GET /api/stats** - Lihat statistik
```bash
curl http://localhost:4000/api/stats
```

**POST /api/scrape** - Scrape artikel hari ini
```bash
curl -X POST http://localhost:4000/api/scrape
```

**POST /api/generate** - Generate AI content
```bash
curl -X POST http://localhost:4000/api/generate
```

**POST /api/send** - Kirim ke Project A
```bash
curl -X POST http://localhost:4000/api/send
```

**POST /api/workflow** - Run full workflow
```bash
curl -X POST http://localhost:4000/api/workflow
```

---

## 📁 File Structure

```
content-generator/
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── README.md                     # Dokumentasi ini
│
├── db.js                         # Database operations
├── scraper.js                    # Web scraping logic
├── ai-generator.js               # Gemini AI integration
├── scheduler.js                  # Integration dengan Project A
├── server.js                     # API server
│
├── test-scraper-limited.js       # Test scraper (5 articles)
├── test-ai-generator.js          # Test AI generator
├── test-send-to-project-a.js     # Test integration
├── run-workflow.js               # Run full workflow
│
└── project-b-setup.sql           # Database schema
```

---

## 🔄 Complete Workflow

### **Dari Awal Sampai YouTube Live:**

1. **Scrape Artikel**
   ```bash
   node test-scraper-limited.js
   ```
   Output: 5 artikel tersimpan di database

2. **Generate AI Content**
   ```bash
   node test-ai-generator.js
   ```
   Output: 3-5 video recommendations

3. **Send to Project A**
   ```bash
   node test-send-to-project-a.js
   ```
   Output: Schedule dibuat di Project A

4. **Start Streaming (di Project A)**
   ```bash
   cd C:\infomedia\yt-stream-node
   npm start
   ```
   Buka: http://localhost:3000/dashboard.html
   Klik: "Start Auto-Loop"

---

## 📊 Database Schema

### Table: `news`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| uri | VARCHAR(500) | URL artikel (unique) |
| judul | VARCHAR(255) | Judul artikel |
| isi_berita | TEXT | Full content |
| tanggal_berita | DATETIME | Tanggal publikasi |
| tanggal_crawl | DATETIME | Tanggal scraping |
| tanggal_proses | DATETIME | Tanggal AI processing |
| status | ENUM | pending/processed/error |

### Table: `rekomendasi`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| judul | VARCHAR(255) | Judul video |
| hashtag | VARCHAR(500) | Hashtag |
| deskripsi | TEXT | Deskripsi |
| konten | TEXT | Konten slide |
| source_news_ids | VARCHAR(500) | ID artikel sumber |
| tanggal_generate | DATETIME | Tanggal generate |
| status | ENUM | pending/sent_to_schedule |
| schedule_id | INT | ID di Project A |

---

## 🤖 AI Prompt Strategy

Prompt Gemini AI dirancang untuk:
- **Target**: Investor, entrepreneur, masyarakat umum
- **Gaya**: Mix formal & kasual edukatif
- **Struktur**: Hook → Context → Analysis → Tips → Prediction → CTA
- **Panjang**: 500-700 kata (durasi 3-5 menit)
- **Output**: 3-5 video dari beberapa artikel terkait
- **Format**: JSON dengan paragraf terpisah (siap untuk slide)

---

## 🛠️ Troubleshooting

### Problem: Scraper tidak dapat artikel
**Solution:**
- Pastikan internet terhubung
- Cek apakah Kontan.co.id bisa diakses
- Coba dengan artikel lebih sedikit: `node test-scraper-limited.js`

### Problem: AI generation timeout
**Solution:**
- Kurangi jumlah artikel (max 10-15 artikel)
- Cek API key Gemini masih valid
- Tunggu beberapa menit (Gemini kadang lambat)

### Problem: Database connection error
**Solution:**
- Cek koneksi ke `ai.umkdigital.id`
- Pastikan credentials di `.env` benar
- Test dengan: `node -e "import('./db.js').then(db => db.getNewsStats().then(console.log))"`

---

## 📈 Performance

- **Scraping**: ~2-3 detik per artikel
- **AI Generation**: ~30-60 detik untuk 5-10 artikel
- **Database Insert**: <1 detik per record

**Estimated Time:**
- Scrape 20 articles: ~1-2 menit
- Generate 5 videos: ~1 menit
- Send to Project A: <10 detik
- **Total: ~3-4 menit** dari scrape sampai siap streaming

---

## 🔐 Security Notes

- `.env` file berisi credentials - **JANGAN** commit ke Git
- API key Gemini sudah di-set, jangan share ke public
- Database credentials untuk internal use only

---

## 🎯 Next Steps / Future Improvements

- [ ] Dashboard web UI untuk Project B
- [ ] Schedule otomatis (cron job) untuk scrape setiap hari
- [ ] Support multiple news sources (Detik, Kompas, dll)
- [ ] Video thumbnail generation
- [ ] Analytics & reporting
- [ ] Webhook notification ke Telegram/Discord

---

## 👨‍💻 Developer

Created for automated YouTube Live content streaming system.

**Project A:** YouTube Live Streaming Server
**Project B:** Content Generator (this project)

---

## 📞 Support

Jika ada error atau pertanyaan, cek:
1. Console log untuk detail error
2. Database untuk status data
3. File README ini untuk troubleshooting

---

**Happy Streaming! 🎥🚀**
