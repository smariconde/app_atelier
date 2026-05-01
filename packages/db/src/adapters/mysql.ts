import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    const pool = mysql.createPool(process.env.DATABASE_URL!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _db = drizzle(pool as any)
  }
  return _db!
}
