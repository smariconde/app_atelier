import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

// Replace '__APP_ID__' with your app's table prefix (from manifest.database.tablePrefix)
export const items = sqliteTable('__APP_ID___items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
