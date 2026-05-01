# MySQL Adapter

Supports PlanetScale, Railway, Render, and any MySQL 8+ database. Uses `mysql2` as the driver.

## Prerequisites

- A MySQL database. Recommended options:
  - **PlanetScale** (https://planetscale.com) — serverless MySQL, free tier
  - **Railway** (https://railway.app) — MySQL with simple setup
  - **Render** (https://render.com) — managed MySQL

## .env configuration

```env
DB_ADAPTER=mysql
DATABASE_URL=mysql://user:password@host:3306/database
```

### PlanetScale
```env
DATABASE_URL=mysql://username:password@aws.connect.psdb.cloud/db-name?ssl={"rejectUnauthorized":true}
```

## First-time setup

```bash
pnpm db:setup
```

## Running migrations

```bash
pnpm db:generate   # generate SQL in ./drizzle/mysql/
pnpm db:migrate    # apply to MySQL
```

## Production considerations

- PlanetScale uses a HTTP-based protocol and requires SSL — include `ssl` in the connection string
- PlanetScale does not support foreign key constraints by default; avoid FK-dependent schemas
- The `Better Auth` provider switches to `mysql` automatically when `DB_ADAPTER=mysql`
