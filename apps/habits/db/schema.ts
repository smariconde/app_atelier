import { table, text, boolean, timestamp } from '@hub/db'
import { createId } from '@paralleldrive/cuid2'

export const habits = table('habits_habits', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().default(''),
  description: text('description').notNull().default(''),
  color: text('color').notNull().default('#F43F5E'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

export const entries = table('habits_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  habitId: text('habit_id').notNull(),
  date: text('date').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
})

export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
