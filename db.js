import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { getJakartaDateTime } from './utils.js';

dotenv.config();

// Connection Pool untuk Project B (content_generator)
const poolProjectB = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PROJECT_B,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connection Pool untuk Project A (schedule_stream)
const poolProjectA = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PROJECT_A,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========================================
// NEWS TABLE OPERATIONS
// ========================================

/**
 * Check if article URI already exists
 */
export async function checkArticleExists(uri) {
  try {
    const [rows] = await poolProjectB.execute(
      `SELECT id FROM news WHERE uri = ? LIMIT 1`,
      [uri]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('❌ Error checking article exists:', error.message);
    throw error;
  }
}

/**
 * Insert artikel ke tabel news
 */
export async function insertNews(data) {
  try {
    const [result] = await poolProjectB.execute(
      `INSERT INTO news (uri, judul, isi_berita, tanggal_berita, status)
       VALUES (?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE
       judul = VALUES(judul),
       isi_berita = VALUES(isi_berita),
       tanggal_berita = VALUES(tanggal_berita)`,
      [data.uri, data.judul, data.isi_berita, data.tanggal_berita]
    );
    return result.insertId;
  } catch (error) {
    console.error('❌ Error inserting news:', error.message);
    throw error;
  }
}

/**
 * Get artikel dengan status pending
 */
export async function getPendingNews() {
  try {
    const [rows] = await poolProjectB.execute(
      `SELECT * FROM news WHERE status = 'pending' ORDER BY tanggal_berita DESC`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error getting pending news:', error.message);
    throw error;
  }
}

/**
 * Get artikel yang belum punya teks generated (pending dan belum ada di rekomendasi)
 * Ini mencegah duplikasi saat generate teks video
 */
export async function getNewsWithoutVideo() {
  try {
    // Ambil artikel pending
    const [allNews] = await poolProjectB.execute(
      `SELECT * FROM news WHERE status = 'pending' ORDER BY tanggal_berita DESC`
    );

    // Ambil semua source_news_ids dari rekomendasi
    const [rekomendasi] = await poolProjectB.execute(
      `SELECT source_news_ids FROM rekomendasi`
    );

    // Bikin set dari news IDs yang sudah punya rekomendasi
    const processedNewsIds = new Set();
    rekomendasi.forEach(r => {
      if (r.source_news_ids) {
        const ids = r.source_news_ids.split(',').map(id => parseInt(id.trim()));
        ids.forEach(id => processedNewsIds.add(id));
      }
    });

    // Filter artikel yang belum ada di rekomendasi
    const unprocessedNews = allNews.filter(article => !processedNewsIds.has(article.id));

    return unprocessedNews;
  } catch (error) {
    console.error('❌ Error getting news without video:', error.message);
    throw error;
  }
}

/**
 * Update status artikel menjadi processed
 */
export async function markNewsAsProcessed(newsIds) {
  try {
    const placeholders = newsIds.map(() => '?').join(',');
    const tanggalProses = getJakartaDateTime();
    const [result] = await poolProjectB.execute(
      `UPDATE news
       SET status = 'processed', tanggal_proses = ?
       WHERE id IN (${placeholders})`,
      [tanggalProses, ...newsIds]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error marking news as processed:', error.message);
    throw error;
  }
}

// ========================================
// REKOMENDASI TABLE OPERATIONS
// ========================================

/**
 * Insert rekomendasi hasil AI generation
 */
export async function insertRekomendasi(data) {
  try {
    const [result] = await poolProjectB.execute(
      `INSERT INTO rekomendasi (judul, hashtag, deskripsi, konten, source_news_ids, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [data.judul, data.hashtag, data.deskripsi, data.konten, data.source_news_ids]
    );
    return result.insertId;
  } catch (error) {
    console.error('❌ Error inserting rekomendasi:', error.message);
    throw error;
  }
}

/**
 * Get rekomendasi dengan status pending
 */
export async function getPendingRekomendasi() {
  try {
    const [rows] = await poolProjectB.execute(
      `SELECT * FROM rekomendasi WHERE status = 'pending' ORDER BY tanggal_generate ASC`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error getting pending rekomendasi:', error.message);
    throw error;
  }
}

/**
 * Update status rekomendasi setelah dikirim ke schedule
 */
export async function markRekomendasiAsSent(rekomendasiId, scheduleId) {
  try {
    const [result] = await poolProjectB.execute(
      `UPDATE rekomendasi
       SET status = 'sent_to_schedule', schedule_id = ?
       WHERE id = ?`,
      [scheduleId, rekomendasiId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error marking rekomendasi as sent:', error.message);
    throw error;
  }
}

// ========================================
// PROJECT A INTEGRATION
// ========================================

/**
 * Insert schedule ke Project A (schedule_stream database)
 */
export async function insertScheduleToProjectA(data) {
  try {
    // Use Jakarta timezone (GMT+7)
    const tanggalCreate = getJakartaDateTime();

    const [result] = await poolProjectA.execute(
      `INSERT INTO schedules (judul, hashtag, deskripsi, konten, tanggal_create, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [data.judul, data.hashtag, data.deskripsi, data.konten, tanggalCreate]
    );
    return result.insertId;
  } catch (error) {
    console.error('❌ Error inserting schedule to Project A:', error.message);
    throw error;
  }
}

// ========================================
// STATISTICS
// ========================================

/**
 * Get statistik news
 */
export async function getNewsStats() {
  try {
    const [rows] = await poolProjectB.execute(
      `SELECT status, COUNT(*) as total FROM news GROUP BY status`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error getting news stats:', error.message);
    throw error;
  }
}

/**
 * Get statistik rekomendasi
 */
export async function getRekomendasiStats() {
  try {
    const [rows] = await poolProjectB.execute(
      `SELECT status, COUNT(*) as total FROM rekomendasi GROUP BY status`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error getting rekomendasi stats:', error.message);
    throw error;
  }
}

export { poolProjectB, poolProjectA };
