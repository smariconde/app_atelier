import type { MySql2Database } from 'drizzle-orm/mysql2'

let _db: MySql2Database<Record<string, never>> | null = null

export function getDb() {
  if (!_db) {
    const mysql = require('mysql2/promise')
    const { drizzle } = require('drizzle-orm/mysql2') as typeof import('drizzle-orm/mysql2')
    const pool = mysql.createPool(process.env.DATABASE_URL!)
    _db = drizzle(pool as any)
  }
  return _db!
}
