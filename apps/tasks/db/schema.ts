import { table, text, integer, boolean, timestamp } from '@hub/db'
import { createId } from '@paralleldrive/cuid2'

export const tasks = table('tasks_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  description: text('description').notNull().default(''),
  priority: text('priority').notNull().default('medium'),
  completed: boolean('completed').notNull().default(false),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
