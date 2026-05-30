import Database from 'better-sqlite3';

export type DB = Database.Database;

/**
 * Open (or create) the SQLite database at `dbPath` and ensure the schema
 * exists. Pass ':memory:' for an ephemeral in-process database (used by tests).
 */
export function createDatabase(dbPath: string): DB {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id        TEXT    PRIMARY KEY,
      title     TEXT    NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT    NOT NULL,
      updatedAt TEXT    NOT NULL
    );
  `);

  return db;
}
