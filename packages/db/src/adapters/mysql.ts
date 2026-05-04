import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    const pool = mysql.createPool(process.env.DATABASE_URL!)
    _db = drizzle(pool as any)
  }
  return _db!
}
