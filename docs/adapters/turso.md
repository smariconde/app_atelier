# Turso Adapter (libSQL)

Turso is a distributed SQLite database. It uses the libSQL protocol and is fully SQLite-compatible — the same schemas work without changes. Ideal for Vercel deployments.

## Prerequisites

- A Turso account: https://turso.tech
- Turso CLI: `brew install tursodatabase/tap/turso`
- `@libsql/client` installed (included in this project's dependencies)

## Create a database

```bash
turso db create my-app
turso db show my-app        # copy the URL
turso db tokens create my-app  # copy the auth token
```

## .env configuration

```env
DB_ADAPTER=turso
DATABASE_URL=libsql://my-app-<account>.turso.io
DATABASE_AUTH_TOKEN=your-auth-token-here
```

## First-time setup

```bash
pnpm db:setup
```

## Running migrations

```bash
pnpm db:generate   # generate SQL in ./drizzle/turso/
pnpm db:migrate    # apply to Turso
```

## Vercel environment variables

Add `DB_ADAPTER`, `DATABASE_URL`, and `DATABASE_AUTH_TOKEN` to your Vercel project settings.

## Production considerations

- Turso has a generous free tier (500 databases, 9GB storage)
- For lowest latency, create the database in the region closest to your Vercel deployment
- `DATABASE_AUTH_TOKEN` must be kept secret — never commit it
