import Database from 'better-sqlite3'
import path from 'path'

// CRITICAL: This script does NOT auto-discover apps/*/db/schema.ts files.
// Every time you add a new app, you must manually add its CREATE TABLE
// block below. This is a manual step until drizzle-kit migrations are wired up (target: v0.5).

const dbPath = process.env.DATABASE_URL ?? './local.db'
const db = new Database(path.resolve(dbPath))
db.pragma('journal_mode = WAL')

console.log(`Setting up database at ${path.resolve(dbPath)}...`)

// Notes app tables
db.exec(`
  CREATE TABLE IF NOT EXISTS notes_notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    created_at INTEGER,
    updated_at INTEGER
  )
`)

// Tasks app tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium',
    completed INTEGER NOT NULL DEFAULT 0,
    due_date INTEGER,
    created_at INTEGER,
    updated_at INTEGER
  )
`)

// Habits app tables
db.exec(`
  CREATE TABLE IF NOT EXISTS habits_habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#F43F5E',
    created_at INTEGER,
    updated_at INTEGER
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS habits_entries (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
  )
`)

// Better Auth tables
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id),
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );
`)

console.log('Database setup complete.')
db.close()
