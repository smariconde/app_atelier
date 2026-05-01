import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const notes = sqliteTable('notes_notes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  content: text('content').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
