# 🚀 Quick Start Guide

## Cara Paling Cepat Run Project B

### **Option 1: Full Workflow (Otomatis Semua) ⭐ RECOMMENDED**

```bash
cd C:\infomedia\content-generator
node run-workflow.js
```

Ini akan:
1. ✅ Ambil artikel pending dari database (atau scrape baru jika perlu)
2. ✅ Generate 3-5 video dengan Gemini AI
3. ✅ Kirim ke Project A schedule table
4. ✅ Siap untuk streaming

**Waktu:** ~3-5 menit

---

### **Option 2: Step by Step (Manual)**

#### 1️⃣ Scrape Artikel Baru
```bash
cd C:\infomedia\content-generator
node test-scraper-limited.js
```
Output: 5 artikel baru di database

#### 2️⃣ Generate AI Content
```bash
node test-ai-generator.js
```
Output: 3-5 video recommendations

#### 3️⃣ Kirim ke Project A
```bash
node test-send-to-project-a.js
```
Output: Schedule dibuat di Project A

#### 4️⃣ Start Streaming (di Project A)
```bash
cd C:\infomedia\yt-stream-node
npm start
```
Buka: http://localhost:3000/dashboard.html
Klik: **"Start Auto-Loop"**

---

### **Option 3: API Server**

#### Start Server
```bash
cd C:\infomedia\content-generator
npm start
```

Server: http://localhost:4000

#### Run Workflow via API
```bash
curl -X POST http://localhost:4000/api/workflow
```

#### Check Status
```bash
curl http://localhost:4000/api/stats
```

---

## 📊 Cek Hasil

### Via phpMyAdmin:
1. Database: `content_generator`
2. Table `news` → lihat artikel yang di-scrape
3. Table `rekomendasi` → lihat video yang di-generate

### Via Command:
```bash
node -e "import('./db.js').then(db => db.getNewsStats().then(console.log))"
```

---

## 🔄 Daily Workflow (Recommended)

**Setiap hari jam berapa aja:**

```bash
# 1. Scrape artikel hari ini
cd C:\infomedia\content-generator
npm run scrape

# 2. Generate & kirim ke Project A
node run-workflow.js

# 3. Start streaming
cd C:\infomedia\yt-stream-node
npm start
```

Buka dashboard → Start Auto-Loop → **Done!** 🎉

---

## ⚠️ Troubleshooting

**Problem:** Tidak ada artikel pending
```bash
# Scrape artikel baru dulu
node test-scraper-limited.js
```

**Problem:** AI generation error
```bash
# Cek API key di .env
cat .env | grep GEMINI

# Test API key
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

**Problem:** Database error
```bash
# Cek koneksi
ping ai.umkdigital.id

# Cek credentials di .env
cat .env | grep DB_
```

---

## 🎯 Expected Results

Dari **5 artikel scraping**, sistem akan generate:
- **3-5 video** dengan konten berkualitas
- **500-700 kata** per video (~3-5 menit durasi)
- **Hashtag** dan **deskripsi** otomatis
- **Siap streaming** ke YouTube Live

---

**That's it! Simple kan? 🚀**
