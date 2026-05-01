import { table, text, timestamp } from '@hub/db'
import { createId } from '@paralleldrive/cuid2'

export const notes = table('notes_notes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  content: text('content').notNull().default(''),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
