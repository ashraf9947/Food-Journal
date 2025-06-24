// components/services/auth.js
import { executeSql } from '../database/database';

// 🔐 Попытка логина по email и паролю
export const loginUser = async (email, password) => {
  const result = await executeSql(
    'SELECT id FROM users WHERE email = ? AND password = ?',
    [email, password]
  );

  const rows = result.rows?._array || [];
  const user = rows[0];
  return user?.id || null;
};

// 🆕 Регистрация нового пользователя
export const registerUser = async (email, password) => {
  await executeSql(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password]
  );

  const result = await executeSql(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  const rows = result.rows?._array || [];
  const user = rows[0];
  return user?.id || null;
};

// 🔍 Проверка существования пользователя по email
export const checkUserExists = async (email) => {
  const result = await executeSql(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  const rows = result.rows?._array || [];
  return rows.length > 0;
};
