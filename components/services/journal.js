// components/services/journal.js
import { executeSql } from '../database/database';

/**
 * Добавить новую запись
 * @param {number} userId
 * @param {string} image — URI или base64
 * @param {string} description
 * @param {string} date — ISO строка
 * @param {string} category
 */
export async function addEntry(userId, image, description, date, category) {
  const result = await executeSql(
    `INSERT INTO journals (userId, imageUri, description, createdAt, category)
     VALUES (?, ?, ?, ?, ?);`,
    [userId, image, description, date, category]
  );
  return result.insertId ?? result?.rows?._array?.[0]?.id;
}

/**
 * Получить все записи данного пользователя
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getEntries(userId) {
  const result = await executeSql(
    'SELECT * FROM journals WHERE userId = ? ORDER BY createdAt DESC;',
    [userId]
  );

  const rows = result.rows?._array || [];
  return rows;
}

/**
 * Удалить запись по её id
 * @param {number} entryId
 */
export async function deleteEntry(entryId) {
  await executeSql(
    'DELETE FROM journals WHERE id = ?;',
    [entryId]
  );
}
