import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const habits = sqliteTable('habits_habits', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().default(''),
  description: text('description').notNull().default(''),
  color: text('color').notNull().default('#F43F5E'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const entries = sqliteTable('habits_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  habitId: text('habit_id').notNull(),
  date: text('date').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
