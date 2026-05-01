import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const tasks = sqliteTable('tasks_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  description: text('description').notNull().default(''),
  priority: text('priority').notNull().default('medium'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
