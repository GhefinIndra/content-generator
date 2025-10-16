/**
 * Utility functions
 */

/**
 * Get current date/time in GMT+7 (Jakarta timezone)
 * Returns MySQL datetime format: YYYY-MM-DD HH:MM:SS
 */
export function getJakartaDateTime() {
  const now = new Date();

  // Convert to Jakarta timezone (GMT+7)
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  // Format to MySQL datetime
  const year = jakartaTime.getFullYear();
  const month = String(jakartaTime.getMonth() + 1).padStart(2, '0');
  const day = String(jakartaTime.getDate()).padStart(2, '0');
  const hours = String(jakartaTime.getHours()).padStart(2, '0');
  const minutes = String(jakartaTime.getMinutes()).padStart(2, '0');
  const seconds = String(jakartaTime.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get current date in GMT+7 (Jakarta timezone)
 * Returns MySQL date format: YYYY-MM-DD
 */
export function getJakartaDate() {
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  const year = jakartaTime.getFullYear();
  const month = String(jakartaTime.getMonth() + 1).padStart(2, '0');
  const day = String(jakartaTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Convert any date to GMT+7 MySQL format
 */
export function toJakartaDateTime(date) {
  const jakartaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  const year = jakartaTime.getFullYear();
  const month = String(jakartaTime.getMonth() + 1).padStart(2, '0');
  const day = String(jakartaTime.getDate()).padStart(2, '0');
  const hours = String(jakartaTime.getHours()).padStart(2, '0');
  const minutes = String(jakartaTime.getMinutes()).padStart(2, '0');
  const seconds = String(jakartaTime.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
