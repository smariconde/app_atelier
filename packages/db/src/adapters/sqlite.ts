import path from 'path'

let _db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle> | null = null

export function getDb(url?: string) {
  if (!_db) {
    const Database = require('better-sqlite3')
    const { drizzle } = require('drizzle-orm/better-sqlite3') as typeof import('drizzle-orm/better-sqlite3')
    const dbPath = url ?? process.env.DATABASE_URL ?? './local.db'
    const sqlite = new Database(path.resolve(dbPath))
    sqlite.pragma('journal_mode = WAL')
    _db = drizzle(sqlite)
  }
  return _db!
}
