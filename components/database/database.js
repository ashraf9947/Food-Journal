import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'FoodJournal.db';
const DATABASE_VERSION = 1;
const DATABASE_DISPLAYNAME = 'Food Journal Database';
const DATABASE_SIZE = 200000;

const database = {
  _initialized: false,
  _initializationPromise: null,
};

// ========== Web (IndexedDB) ==========
const webDb = {
  _db: null,

  async init() {
    if (this._db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('users')) {
          const users = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          users.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('journals')) {
          const journals = db.createObjectStore('journals', { keyPath: 'id', autoIncrement: true });
          journals.createIndex('userId', 'userId');
          journals.createIndex('category', 'category');
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        console.log('✅ IndexedDB connected');
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  },

  async executeSql(sql, params = []) {
    if (!this._db) await this.init();
    const result = await this._parseSql(sql, params);
    return { rows: { _array: result, length: result.length } };
  },

  async _parseSql(sql, params) {
    const lowerSql = sql.toLowerCase().trim();
    if (lowerSql.startsWith('insert into')) return [await this._insert(lowerSql, params)];
    if (lowerSql.startsWith('select')) return await this._select(lowerSql, params);
    if (lowerSql.startsWith('delete')) {
      await this._delete(lowerSql);
      return [];
    }
    return [];
  },

  _getObjectStore(table, mode = 'readonly') {
    const tx = this._db.transaction([table], mode);
    return tx.objectStore(table);
  },

  _prepareInsertData(sql, params) {
    const columns = sql.match(/\((.*?)\)/)[1].split(',').map(s => s.trim());
    const data = {};
    columns.forEach((col, i) => {
      data[col] = params[i];
    });
    return data;
  },

  async _insert(sql, params) {
    const table = sql.match(/insert into (\w+)/i)[1];
    const store = this._getObjectStore(table, 'readwrite');
    const data = this._prepareInsertData(sql, params);

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve({ insertId: request.result, ...data });
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async _select(sql, params = []) {
    const table = sql.match(/from (\w+)/i)?.[1];
    if (!table) throw new Error('No table specified in SELECT');

    const store = this._getObjectStore(table);
    const result = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          result.push(cursor.value);
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      request.onerror = reject;
    });
  },

  async _delete(sql) {
    const table = sql.match(/from (\w+)/i)?.[1];
    if (!table) throw new Error('No table specified in DELETE');

    const store = this._getObjectStore(table, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }
};

// ========== Native (expo-sqlite) ==========
const nativeDb = {
  _db: null,

  async init() {
    if (this._db) return;
    this._db = SQLite.openDatabase(
      DATABASE_NAME,
      DATABASE_VERSION.toString(),
      DATABASE_DISPLAYNAME,
      DATABASE_SIZE
    );
    await this.executeSql('SELECT 1');
    console.log('✅ SQLite initialized');
  },

  async executeSql(sql, params = []) {
    if (!this._db) await this.init();

    return new Promise((resolve, reject) => {
      this._db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            console.error('SQLite error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// ========== Universal Wrapper ==========
const implementation = Platform.OS === 'web' ? webDb : nativeDb;

export async function initDatabase() {
  if (database._initialized) return true;
  if (database._initializationPromise) return database._initializationPromise;

  database._initializationPromise = (async () => {
    console.log('🟡 Initializing database...');
    await implementation.init();

    if (Platform.OS !== 'web') {
      const tableSQL = [
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          imageUri TEXT,
          description TEXT,
          category TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id)
        )`,
        `CREATE INDEX IF NOT EXISTS idx_journals_user ON journals(userId)`,
        `CREATE INDEX IF NOT EXISTS idx_journals_category ON journals(category)`
      ];
      for (const sql of tableSQL) {
        await implementation.executeSql(sql);
      }
    }

    database._initialized = true;
    console.log('✅ Database initialized successfully');
    return true;
  })();

  return database._initializationPromise;
}

export async function executeSql(sql, params = []) {
  if (!database._initialized && !database._initializationPromise) {
    await initDatabase();
  }
  return implementation.executeSql(sql, params);
}

export const db = {
  initDatabase,
  executeSql,
  _impl: implementation,
};
