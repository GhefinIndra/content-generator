/**
 * COMPREHENSIVE Financial Keywords
 * Topics: USD, Forex, Commodities, Stocks, Crypto, Economic Policy
 */
export const FINANCIAL_KEYWORDS = {
  // USD & Forex
  usd: ['usd', 'dolar', 'dollar', 'rupiah', 'idr', 'kurs', 'nilai tukar', 'mata uang', 'forex', 'valuta asing', 'exchange rate'],

  // Federal Reserve & Monetary Policy
  fed: ['federal reserve', 'the fed', 'fed rate', 'suku bunga', 'interest rate', 'inflasi', 'inflation', 'deflasi', 'kebijakan moneter', 'monetary policy'],

  // Commodities
  gold: ['emas', 'gold', 'perak', 'silver', 'logam mulia'],
  oil: ['minyak', 'oil', 'crude', 'brent', 'wti', 'opec', 'bbm', 'energi'],
  commodity: ['komoditas', 'commodity', 'bahan baku', 'raw material'],

  // Stock Market
  stock: ['saham', 'stock', 'bursa', 'ihsg', 'idx', 'wall street', 'nasdaq', 'dow jones', 's&p', 's&p500', 'nyse'],

  // Crypto
  crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'kripto', 'blockchain', 'altcoin'],

  // Global Economy
  economy: ['ekonomi', 'economy', 'gdp', 'pdb', 'pertumbuhan ekonomi', 'resesi', 'recession', 'ekspor', 'impor', 'perdagangan', 'trade', 'tarif'],

  // Banking & Finance
  banking: ['bank', 'banking', 'bi', 'bank indonesia', 'ojk', 'kredit', 'loan', 'financing', 'likuiditas'],

  // Investment
  investment: ['investasi', 'investment', 'investor', 'reksadana', 'obligasi', 'bond', 'yield', 'return', 'profit', 'dividen']
};

/**
 * Flatten all keywords into single array
 */
export function getAllKeywords() {
  return Object.values(FINANCIAL_KEYWORDS).flat();
}

/**
 * Check if article title matches any financial keyword
 * @param {string} title - Article title
 * @param {boolean} strict - If true, requires exact match. If false, partial match OK
 * @returns {boolean}
 */
export function matchesFinancialKeyword(title, strict = false) {
  if (!title) return false;

  const titleLower = title.toLowerCase();
  const keywords = getAllKeywords();

  if (strict) {
    // Exact word match
    return keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(titleLower);
    });
  } else {
    // Partial match (more lenient)
    return keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
  }
}

/**
 * Get matching keywords from title
 * @param {string} title - Article title
 * @returns {string[]} - Array of matched keywords
 */
export function getMatchedKeywords(title) {
  if (!title) return [];

  const titleLower = title.toLowerCase();
  const keywords = getAllKeywords();

  return keywords.filter(keyword => titleLower.includes(keyword.toLowerCase()));
}

/**
 * Categorize article by dominant topic
 * @param {string} title - Article title
 * @returns {string} - Category name (usd, gold, stock, etc.)
 */
export function categorizeArticle(title) {
  if (!title) return 'uncategorized';

  const titleLower = title.toLowerCase();

  // Check each category
  for (const [category, keywords] of Object.entries(FINANCIAL_KEYWORDS)) {
    if (keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return 'uncategorized';
}

/**
 * Filter articles by financial keywords
 * @param {Array} articles - Array of article objects with 'judul' field
 * @param {boolean} strict - Strict matching mode
 * @returns {Array} - Filtered articles with category info
 */
export function filterFinancialArticles(articles, strict = false) {
  return articles
    .filter(article => matchesFinancialKeyword(article.judul, strict))
    .map(article => ({
      ...article,
      category: categorizeArticle(article.judul),
      matched_keywords: getMatchedKeywords(article.judul)
    }));
}

/**
 * Get statistics of filtered articles
 */
export function getFilterStats(articles) {
  const filtered = filterFinancialArticles(articles, false);

  const stats = {
    total_articles: articles.length,
    matched_articles: filtered.length,
    match_rate: ((filtered.length / articles.length) * 100).toFixed(1) + '%',
    categories: {}
  };

  // Count by category
  filtered.forEach(article => {
    const cat = article.category;
    stats.categories[cat] = (stats.categories[cat] || 0) + 1;
  });

  return stats;
}
