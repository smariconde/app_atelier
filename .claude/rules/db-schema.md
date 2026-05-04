# Rule — Drizzle schema

All apps share one database. Table-name collisions are prevented by a per-app prefix.

## Table prefix (non-negotiable)

Every table name in `apps/<appId>/db/schema.ts` must start with `<appId>_`. Examples:

```ts
export const tasks = sqliteTable('tasks_tasks', { ... })
export const completions = sqliteTable('habits_completions', { ... })
```

A table without the correct prefix is a bug — reject the change.

## Column conventions

| Use | Pattern |
|---|---|
| Primary key | `text('id').primaryKey().$defaultFn(() => createId())` (cuid2) |
| Timestamp | `integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())` |
| Required string | `text('field').notNull().default('')` |
| Optional string | `text('field')` |
| Enum-like text | `text('priority', { enum: ['low','medium','high'] }).notNull().default('medium')` |
| Boolean | `integer('done', { mode: 'boolean' }).notNull().default(false)` |
| Float | `real('score').notNull().default(0)` |

Always import `createId` from `@paralleldrive/cuid2` and table helpers from `@hub/db` (dialect-agnostic) — not directly from `drizzle-orm/sqlite-core`.

## Migration safety

- **Adding a column**: must be nullable OR have a default — never break existing rows.
- **Never DROP** a column. If a field is no longer used, leave it and stop writing to it.
- Use `drizzle-kit generate` then `drizzle-kit migrate` (versioned). `push` is fallback only.
- Always show the SQL before applying.

## Files

- Schema: `apps/<appId>/db/schema.ts`
- Drizzle config: `apps/<appId>/drizzle.config.ts` (auto-created on first migration)
- Migrations: `apps/<appId>/db/migrations/<timestamp>_<name>.sql` (committed)
