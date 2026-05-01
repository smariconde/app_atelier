/**
 * Dialect-agnostic schema helpers for @hub/db.
 *
 * App schemas import { table, text, integer, boolean, timestamp } from '@hub/db'
 * instead of directly from drizzle-orm/sqlite-core.
 *
 * TypeScript canonical type = sqlite (precise for sqlite/turso/d1, approximate for pg/mysql).
 * Runtime dispatches to the correct dialect factory based on DB_ADAPTER env var.
 * The `as unknown as` casts are intentional — Drizzle's query builder generates
 * correct SQL for each dialect regardless of the TS type.
 */
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
} from 'drizzle-orm/sqlite-core'
import {
  pgTable,
  text as pgText,
  integer as pgInteger,
  boolean as pgBoolean,
  timestamp as pgTimestamp,
} from 'drizzle-orm/pg-core'
import {
  mysqlTable,
  text as mysqlText,
  int as mysqlInt,
  boolean as mysqlBoolean,
  datetime as mysqlDatetime,
} from 'drizzle-orm/mysql-core'

const adapter = process.env.DB_ADAPTER ?? 'sqlite'

// ─── Table factory ─────────────────────────────────────────────────────────────

export const table = (
  adapter === 'postgres' ? pgTable : adapter === 'mysql' ? mysqlTable : sqliteTable
) as unknown as typeof sqliteTable

// ─── Column helpers ────────────────────────────────────────────────────────────

export const text = (
  adapter === 'postgres' ? pgText : adapter === 'mysql' ? mysqlText : sqliteText
) as unknown as typeof sqliteText

// Use real column builders for type anchors so TypeScript infers the correct
// $inferSelect types (Date for timestamp, boolean for boolean, number for integer).
const _tsCol = sqliteInteger('_', { mode: 'timestamp' as const })
const _boolCol = sqliteInteger('_', { mode: 'boolean' as const })
const _intCol = sqliteInteger('_')

type TSColType = typeof _tsCol
type BoolColType = typeof _boolCol
type IntColType = typeof _intCol

export function timestamp(name: string): TSColType {
  if (adapter === 'postgres') return pgTimestamp(name) as unknown as TSColType
  if (adapter === 'mysql') return mysqlDatetime(name) as unknown as TSColType
  return sqliteInteger(name, { mode: 'timestamp' }) as unknown as TSColType
}

export function boolean(name: string): BoolColType {
  if (adapter === 'postgres') return pgBoolean(name) as unknown as BoolColType
  if (adapter === 'mysql') return mysqlBoolean(name) as unknown as BoolColType
  return sqliteInteger(name, { mode: 'boolean' }) as unknown as BoolColType
}

export function integer(name: string): IntColType {
  if (adapter === 'postgres') return pgInteger(name) as unknown as IntColType
  if (adapter === 'mysql') return mysqlInt(name) as unknown as IntColType
  return sqliteInteger(name) as unknown as IntColType
}
