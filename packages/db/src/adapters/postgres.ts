let _db: ReturnType<typeof import('drizzle-orm/postgres-js').drizzle> | null = null

export function getDb() {
  if (!_db) {
    const postgres = require('postgres')
    const { drizzle } = require('drizzle-orm/postgres-js') as typeof import('drizzle-orm/postgres-js')
    const client = postgres(process.env.DATABASE_URL!)
    _db = drizzle(client)
  }
  return _db!
}
