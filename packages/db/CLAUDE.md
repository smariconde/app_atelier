# @hub/db

Drizzle ORM wrapper with a pluggable adapter. Switch backends by changing `DB_ADAPTER` in `.env` — no code changes needed.

## Usage

```typescript
import { getDb } from '@hub/db'

const db = getDb()
const rows = await db.select().from(myTable)
```

`getDb()` is a singleton — one connection per process (except D1, which requires a binding per request).

## DB_ADAPTER env var

| Value | Backend | Driver |
|---|---|---|
| `sqlite` (default) | `better-sqlite3`, local file | — |
| `turso` | Turso (libSQL) | `@libsql/client` |
| `postgres` | Supabase / Neon / Vercel Postgres | `postgres` (postgres.js) |
| `mysql` | PlanetScale / Railway | `mysql2` |
| `d1` | Cloudflare D1 (CF Pages only) | CF Worker binding |

See `docs/adapters/<name>.md` for per-adapter setup guides.

## Schema conventions

App schemas import dialect-agnostic helpers from `@hub/db`:

```typescript
// apps/notes/db/schema.ts
import { table, text, timestamp } from '@hub/db'
import { createId } from '@paralleldrive/cuid2'

export const notes = table('notes_notes', {  // ← prefix: 'notes_'
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})
```

### Available helpers from `@hub/db`

| Helper | SQLite | Postgres | MySQL |
|---|---|---|---|
| `table(name, cols)` | `sqliteTable` | `pgTable` | `mysqlTable` |
| `text(name)` | `text` | `text` | `text` |
| `integer(name)` | `integer` | `integer` | `int` |
| `boolean(name)` | `integer(mode:'boolean')` | `boolean` | `boolean` |
| `timestamp(name)` | `integer(mode:'timestamp')` | `timestamp` | `datetime` |

- **Table names** must start with the app's `tablePrefix` from its manifest
- **IDs** use `@paralleldrive/cuid2` via `$defaultFn(() => createId())`
- TypeScript canonical type = sqlite (precise for sqlite/turso/d1; approximate for pg/mysql)

## Migrations

```bash
pnpm db:setup      # drizzle-kit push (dev/initial — no migration files)
pnpm db:migrate    # drizzle-kit generate + migrate (production)
pnpm db:generate   # generate SQL migration files only
pnpm db:studio     # open Drizzle Studio to browse the DB
```

Schema auto-discovery: `drizzle.config.ts` globs `./apps/*/db/schema.ts` — no manual registration needed when you add a new app.
