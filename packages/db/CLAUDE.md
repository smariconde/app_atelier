# @hub/db

Drizzle ORM wrapper with a pluggable adapter. Only SQLite is implemented; other adapters are planned for v0.5.

## Usage

```typescript
import { getDb } from '@hub/db'

const db = getDb()
const rows = await db.select().from(myTable)
```

`getDb()` is a singleton — one connection per process.

## DB_ADAPTER env var

| Value | Backend | Status |
|---|---|---|
| `sqlite` (default) | `better-sqlite3`, local file | v0.3 ✓ |
| `turso` | Turso (libSQL) | v0.5 |
| `postgres` | Supabase / Neon / Vercel | v0.5 |
| `d1` | Cloudflare D1 | v0.5 |

Switching adapters requires only changing `.env`, never code.

## Schema conventions

1. **Import** from `drizzle-orm/sqlite-core` (will change per adapter in v0.5)
2. **Table names** must start with the app's `tablePrefix` from its manifest
3. **IDs** use `@paralleldrive/cuid2` via `$defaultFn(() => createId())`
4. **Timestamps** use `integer('col', { mode: 'timestamp' }).$defaultFn(() => new Date())`

```typescript
// apps/notes/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const notes = sqliteTable('notes_notes', {  // ← prefix: 'notes_'
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

## Migrations (v0.1)

Tables are created by `pnpm db:setup` (`scripts/db-setup.ts`). Raw `CREATE TABLE IF NOT EXISTS` SQL. Drizzle Kit migrations are planned for v0.5.
