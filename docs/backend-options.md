# Backend Options

AppAtelier uses a pluggable database adapter system. Switch adapters by changing two environment variables — no code changes required.

---

## Adapter comparison

| Adapter | Driver | Best for | Pros | Cons |
|---|---|---|---|---|
| **SQLite** | `better-sqlite3` | Local dev | Zero setup, fast, file-based | Ephemeral on serverless; no replication |
| **Turso** | `@libsql/client` | Vercel deploy | SQLite-compatible, free tier, low latency | Requires Turso account |
| **Postgres** | `postgres` (postgres.js) | Teams, Vercel | Standard SQL, excellent tooling, many providers | Connection pooling needed on serverless |
| **MySQL** | `mysql2` | PlanetScale | Serverless-native branching, good free tier | Doesn't support some Postgres features |
| **Cloudflare D1** | `@cloudflare/d1` | Cloudflare Pages | Edge-native SQLite, free tier | Only works on Cloudflare Workers runtime |

---

## How to switch

Set two variables in `.env` (or in Vercel's environment settings for production):

```env
DB_ADAPTER=turso
DATABASE_URL=libsql://my-app-yourname.turso.io
DATABASE_AUTH_TOKEN=eyJhb...
```

That's it. `@hub/db` reads `DB_ADAPTER` at startup and initializes the correct Drizzle driver. All app schemas, server actions, and queries work identically across all adapters.

After switching, push your schemas to the new database:

```bash
pnpm db:setup
```

---

## Adapter-specific setup

Each adapter has its own setup guide in `docs/adapters/`:

- [SQLite](./adapters/sqlite.md) — default, local dev only
- [Turso](./adapters/turso.md) — recommended for Vercel (SQLite-compatible)
- [Postgres](./adapters/postgres.md) — Neon, Supabase, Vercel Postgres
- [MySQL](./adapters/mysql.md) — PlanetScale
- [Cloudflare D1](./adapters/d1.md) — Cloudflare Workers runtime

---

## SQLite in production

SQLite works for self-hosted single-server deployments (Docker + Caddy). It does not work on Vercel because the filesystem is ephemeral — the database file is lost between function invocations.

For Vercel, use Turso (SQLite-compatible, no schema changes needed) or Postgres.

---

## Cross-subdomain SSO

Better Auth (`@hub/auth`) sets session cookies with `domain: .yourdomain.com` (note the leading dot). This makes the cookie available on all subdomains — `notes.yourdomain.com`, `tasks.yourdomain.com`, and `yourdomain.com` all share the same session.

SSO works identically across all database adapters. The auth tables (`auth_users`, `auth_sessions`, etc.) are created by `@hub/auth` using the same Drizzle instance as the rest of the app.

---

## Migrations

All adapters support both push and migration workflows:

```bash
# Push mode (dev — idempotent, no migration files)
pnpm db:setup

# Migration files (production-safe versioning)
pnpm db:generate   # generate SQL in ./drizzle/<adapter>/
pnpm db:migrate    # apply pending migrations
pnpm db:reset      # drop + recreate (local dev only)
```

For schema changes on a live database, use the `db-migrator` agent via `/modify-app` — it generates the SQL, shows it to you, and applies it after confirmation.
