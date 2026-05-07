let _db: ReturnType<typeof import('drizzle-orm/libsql').drizzle> | null = null

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is required for Turso adapter')
    const { createClient } = require('@libsql/client') as typeof import('@libsql/client')
    const { drizzle } = require('drizzle-orm/libsql') as typeof import('drizzle-orm/libsql')
    const client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    _db = drizzle(client)
  }
  return _db!
}
