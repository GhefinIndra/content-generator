# 💰 Financial Content Workflow Guide

## 🎯 New Workflow Overview

**Strategy:** 1 Article = 1 Video (Focused Financial Insights)

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: SCRAPE ALL ARTICLES TODAY                     │
│  ────────────────────────────────────────────          │
│  • Source: Kontan.co.id (all pages)                    │
│  • No limit on articles                                 │
│  • Smart delays: 2s per article + progressive          │
│  • Delay between pages: 3-5s (random)                  │
│  • Save all to database → status: pending              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: FILTER BY FINANCIAL KEYWORDS                  │
│  ────────────────────────────────────────────          │
│  Keywords:                                              │
│  • USD/Forex: dolar, rupiah, kurs, nilai tukar         │
│  • Fed/Policy: federal reserve, suku bunga, inflasi    │
│  • Commodities: emas, minyak, komoditas                │
│  • Stock: saham, ihsg, wall street                     │
│  • Crypto: bitcoin, ethereum, kripto                   │
│  • Economy: ekonomi, gdp, resesi, perdagangan          │
│                                                         │
│  Matching: Loose (partial match)                       │
│  Result: ~20-50% of articles match                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: GENERATE 1 VIDEO PER ARTICLE                  │
│  ────────────────────────────────────────────          │
│  For EACH matched article:                             │
│    1. Send to Gemini AI                                │
│    2. Generate focused video (300-800 words)           │
│    3. Structure:                                        │
│       - Hook (fakta mengejutkan)                       │
│       - Analisis (apa, mengapa, dampak)                │
│       - Prediksi H+7 (3 skenario)                      │
│       - Actionable tips (3-5 tips)                     │
│       - Closing (key takeaway)                         │
│    4. Clean format (no markdown, no emoji)             │
│    5. Save to database → rekomendasi                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Step 4: SEND TO PROJECT A                             │
│  ────────────────────────────────────────────          │
│  • Insert each video to schedules table                │
│  • Ready for YouTube streaming                         │
│  • Auto-loop will stream one by one                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run

### **Option 1: Full Workflow (ONE COMMAND)** ⭐

```bash
cd C:\infomedia\content-generator
npm run workflow
```

**or:**

```bash
node run-financial-workflow.js
```

**What it does:**
1. Scrapes ALL articles from Kontan today
2. Filters by financial keywords
3. Generates 1 video per matched article
4. Sends to Project A
5. Ready to stream!

**Time:** 15-30 minutes (depending on article count)

---

### **Option 2: Step by Step (Manual Testing)**

#### 1️⃣ **Test Scraper**
```bash
npm run test-scraper
```
Result: All articles saved to database

#### 2️⃣ **Test AI Generator**
```bash
npm run test-ai
```
Result: Videos generated for matched articles

#### 3️⃣ **Send to Project A**
```bash
node test-send-to-project-a.js
```
Result: Schedules created

---

## 📊 Expected Output

### **Scraping Phase:**
```
📰 Found 20 articles on page 1
   [1/20] 📰 Dolar AS Menguat ke Rp15,500
      ✅ Saved (2,500 chars)
   [2/20] 📰 Harga Emas Turun 2%
      ✅ Saved (2,200 chars)
   ...
   ⏳ Waiting 2s before next article...

✅ Scraping completed!
📊 Total pages scraped: 5
📰 Total articles saved: 95
```

### **Filtering Phase:**
```
🔍 Filtering by financial keywords...
✅ Matched 42 financial articles

📊 Filter Statistics:
   Total articles: 95
   Matched: 42 (44.2%)
   Categories: {
     usd: 15,
     stock: 10,
     gold: 8,
     economy: 9
   }
```

### **Generation Phase:**
```
[1/42] 🎬 Generating video for:
   Title: Dolar AS Menguat ke Rp15,500
   Category: usd
   Keywords: dolar, rupiah, kurs
   ✅ Video generated and saved (ID: 1)
   📏 Content length: 650 chars

[2/42] 🎬 Generating video for:
   Title: Harga Emas Turun 2%
   Category: gold
   Keywords: emas, gold
   ✅ Video generated and saved (ID: 2)
   📏 Content length: 580 chars
...

✅ Content generation completed!
📹 Total videos generated: 42
```

---

## 🎯 Keyword Categories

### **1. USD & Forex** 🇺🇸💱
```
usd, dolar, dollar, rupiah, idr, kurs,
nilai tukar, mata uang, forex, valuta asing,
exchange rate
```

### **2. Federal Reserve & Policy** 🏦📈
```
federal reserve, the fed, fed rate, suku bunga,
interest rate, inflasi, inflation, deflasi,
kebijakan moneter, monetary policy
```

### **3. Commodities** 🥇🛢️
```
Emas: emas, gold, perak, silver, logam mulia
Minyak: minyak, oil, crude, brent, wti, opec, bbm
Komoditas: komoditas, commodity, bahan baku
```

### **4. Stock Market** 📊
```
saham, stock, bursa, ihsg, idx, wall street,
nasdaq, dow jones, s&p, s&p500, nyse
```

### **5. Crypto** ₿
```
bitcoin, btc, ethereum, eth, crypto, kripto,
blockchain, altcoin
```

### **6. Global Economy** 🌍
```
ekonomi, economy, gdp, pdb, pertumbuhan ekonomi,
resesi, recession, ekspor, impor, perdagangan,
trade, tarif
```

### **7. Banking & Finance** 🏦
```
bank, banking, bi, bank indonesia, ojk, kredit,
loan, financing, likuiditas
```

### **8. Investment** 💼
```
investasi, investment, investor, reksadana,
obligasi, bond, yield, return, profit, dividen
```

---

## 📝 AI Prompt Structure

For each article, AI generates video with this structure:

### **1. HOOK (50-80 words)**
- Fakta mengejutkan / angka penting
- Relate dengan kehidupan sehari-hari
- Buat penasaran

**Example:**
> "Dolar AS naik 2% dalam sehari, mencapai Rp15,500. Ini level tertinggi dalam 3 bulan terakhir. Apa artinya untuk tabungan kita? Apakah ini saat yang tepat untuk beli dolar atau justru harus waspada?"

### **2. KONTEKS & ANALISIS (150-250 words)**
- Apa yang terjadi
- Mengapa ini terjadi
- Dampak ke berbagai pihak
- Data dan angka dari artikel

### **3. PREDIKSI H+7 (100-200 words)**
- 3 Skenario:
  * **Best case**: Optimis (contoh: Rupiah rebound ke Rp15,200)
  * **Most likely**: Realistis (contoh: Stabil di Rp15,400-15,600)
  * **Worst case**: Pesimis (contoh: Melemah ke Rp15,800)

### **4. ACTIONABLE TIPS (80-150 words)**
- 3-5 tips praktis
- Berbeda untuk profil berbeda
- Bisa dilakukan hari ini/minggu ini

**Example:**
> "Untuk investor konservatif: Tahan posisi dolar yang ada, jangan panic sell..."
> "Untuk trader: Watch level support di 15,400..."

### **5. CLOSING (30-50 words)**
- Ringkasan key takeaway
- Call to action

---

## ✨ Output Format (Clean!)

### **❌ OLD Format (with markdown):**
```
**Dolar naik** 2% hari ini. #USD #Forex

Ini **sangat penting** untuk investor! 🚀
```

### **✅ NEW Format (clean):**
```
Dolar naik 2% hari ini.

Ini sangat penting untuk investor!
```

**Removed:**
- ❌ `**bold**` markdown
- ❌ `#hashtag` in content
- ❌ Emoji in content (optional)
- ❌ Any formatting characters

**Kept:**
- ✅ Hashtag in `hashtag` field (for YouTube metadata)
- ✅ Clean paragraphs (double newline separator)
- ✅ Plain text, easy to read

---

## 🔧 Customization

### **Change Keywords**

Edit `keyword-filter.js`:

```javascript
export const FINANCIAL_KEYWORDS = {
  // Add your custom keywords
  myTopic: ['keyword1', 'keyword2', 'keyword3'],
  ...
};
```

### **Change Matching Mode**

In `ai-generator-single.js`, line ~30:

```javascript
// Loose matching (current)
const filteredArticles = filterFinancialArticles(allArticles, false);

// Strict matching (exact word match only)
const filteredArticles = filterFinancialArticles(allArticles, true);
```

### **Change Video Length**

Edit prompt in `ai-generator-single.js`, line ~51:

```javascript
// Current: 300-800 words
Buatlah 1 video singkat (300-800 kata)

// Change to: 500-1000 words for longer videos
Buatlah 1 video (500-1000 kata)
```

### **Change Delay Settings**

Edit `scraper-unlimited.js`:

```javascript
// Line 124: Delay per article
const baseDelay = 2000;  // Change to 3000 for slower

// Line 125: Progressive delay
const progressiveDelay = Math.floor(totalArticles / 10) * 500;
// Increase 500 to 1000 for more cautious scraping
```

---

## 📈 Performance Metrics

### **Typical Run (100 articles scraped):**

| Phase | Time | Details |
|-------|------|---------|
| Scraping | 5-10 min | 100 articles × 3s avg |
| Filtering | <1 sec | Instant keyword matching |
| AI Generation | 10-15 min | 40 matches × 20s each |
| Send to Project A | <10 sec | Fast DB insert |
| **Total** | **15-25 min** | Fully automated |

### **Output:**
- Articles scraped: ~100
- Matched articles: ~40-50 (40-50%)
- Videos generated: 40-50
- Ready to stream: 40-50 videos

---

## 🎬 Streaming the Results

After workflow completes:

```bash
cd C:\infomedia\yt-stream-node
npm start
```

Open: http://localhost:3000/dashboard.html

Click: **"Start Auto-Loop"**

**Result:** Your 40-50 financial insight videos will stream automatically to YouTube Live! 🚀

---

## 🛠️ Troubleshooting

### **Problem: No articles matched**

**Cause:** Today's articles don't contain financial keywords

**Solution:**
1. Check scraped articles: `SELECT judul FROM news WHERE status='pending' LIMIT 20`
2. Maybe today's content is different (weekend, holiday)
3. Try looser keyword matching or add more keywords

### **Problem: AI generation timeout**

**Cause:** Too many articles to process

**Solution:**
1. Process in batches (edit code to limit to first 20)
2. Increase timeout in Gemini API
3. Run at different time (less API traffic)

### **Problem: Scraper blocked**

**Cause:** Too many requests, Kontan detected bot

**Solution:**
1. Increase delays in scraper (3-5s per article)
2. Use VPN/proxy
3. Run at off-peak hours
4. Wait 1 hour and try again

---

## 📚 Files Reference

### **New Files:**
- `scraper-unlimited.js` - Unlimited scraper with smart delays
- `keyword-filter.js` - Financial keyword matching
- `ai-generator-single.js` - 1 article = 1 video generator
- `run-financial-workflow.js` - Main workflow runner
- `test-scraper-unlimited.js` - Test scraper
- `test-ai-single.js` - Test AI generator

### **Modified Files:**
- `package.json` - Added new scripts

### **Unchanged:**
- Old files still work (backward compatible)
- Use `run-workflow.js` for old multi-article merging
- Use `run-financial-workflow.js` for new 1:1 approach

---

## 🎯 Best Practices

### **Daily Workflow:**

**Morning (9-10 AM):**
```bash
cd C:\infomedia\content-generator
npm run workflow
```
Wait 20-30 minutes for completion.

**Afternoon (12-1 PM):**
```bash
cd C:\infomedia\yt-stream-node
npm start
```
Start auto-loop streaming.

**Result:** 40-50 fresh financial insight videos streaming throughout the day! 📈

### **Quality Tips:**

1. **Run daily** - Fresh content performs better
2. **Monitor keywords** - Adjust based on trending topics
3. **Check output** - Verify first few videos look good
4. **Iterate prompt** - Improve AI prompt based on results
5. **Track performance** - See which topics get more views

---

## 🎉 Success!

You now have a **fully automated financial content generation system**!

**From news articles → AI insights → YouTube Live**

All in ~20 minutes, fully hands-off! 🚀💰

---

**Questions? Check the code comments or run with `--help` flag!**
