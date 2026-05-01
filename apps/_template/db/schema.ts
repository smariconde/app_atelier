import { table, text, timestamp } from '@hub/db'
import { createId } from '@paralleldrive/cuid2'

// Replace '__APP_ID__' with your app's table prefix (from manifest.database.tablePrefix)
export const items = table('__APP_ID___items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
