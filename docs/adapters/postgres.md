# Postgres Adapter

Supports Supabase, Neon, Vercel Postgres, and any standard PostgreSQL database. Uses `postgres` (postgres.js) as the driver.

## Prerequisites

- A Postgres database. Recommended options:
  - **Neon** (https://neon.tech) — serverless Postgres, free tier
  - **Supabase** (https://supabase.com) — Postgres with extras, free tier
  - **Vercel Postgres** — native Vercel integration

## .env configuration

```env
DB_ADAPTER=postgres
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Neon (serverless — pooled connection)
```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase (Transaction pooler — recommended for serverless)
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Vercel Postgres
Set via `vercel env pull` — automatically populates `POSTGRES_URL` which you can alias as `DATABASE_URL`.

## First-time setup

```bash
pnpm db:setup
```

This creates all tables via `drizzle-kit push`.

## Running migrations

```bash
pnpm db:generate   # generate SQL in ./drizzle/postgres/
pnpm db:migrate    # apply to Postgres
```

## Production considerations

- Always use SSL (`?sslmode=require` or configured in the connection string)
- For Neon/Supabase on serverless (Vercel), use the **pooled** connection string to avoid connection exhaustion
- The `Better Auth` provider switches to `pg` automatically when `DB_ADAPTER=postgres`
