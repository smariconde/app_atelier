import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

let _db: ReturnType<typeof drizzle> | null = null

export function getDb(url?: string) {
  if (!_db) {
    const dbPath = url ?? process.env.DATABASE_URL ?? './local.db'
    const sqlite = new Database(path.resolve(dbPath))
    sqlite.pragma('journal_mode = WAL')
    _db = drizzle(sqlite)
  }
  return _db
}
