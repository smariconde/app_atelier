# SQLite Adapter

The default adapter. Uses `better-sqlite3` for a local file database. No external service required.

## Prerequisites

None — `better-sqlite3` is installed by default.

## .env configuration

```env
DB_ADAPTER=sqlite
DATABASE_URL=./local.db
```

`DATABASE_URL` is a file path (relative to project root). WAL mode is enabled automatically.

## First-time setup

```bash
pnpm db:setup
```

This runs `drizzle-kit push` which creates all tables from your schema files.

## Running migrations

For local dev, `pnpm db:setup` is sufficient (idempotent push). For versioned migration files:

```bash
pnpm db:generate   # generate SQL migration files in ./drizzle/sqlite/
pnpm db:migrate    # apply pending migrations
```

## Reset (local dev)

```bash
pnpm db:reset
```

Deletes `local.db` (and WAL/SHM files) then re-runs `pnpm db:setup`.

## Production considerations

SQLite is ideal for single-server deployments. For Vercel (serverless), SQLite doesn't work due to ephemeral filesystem — use Turso, Postgres, or D1 instead.
