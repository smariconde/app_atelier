import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    _db = drizzle(client)
  }
  return _db
}
