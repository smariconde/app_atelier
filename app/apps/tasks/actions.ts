'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@hub/db'
import { tasks } from '../../../apps/tasks/db/schema'
import { eq, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function createTask(formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const description = (formData.get('description') as string) ?? ''
  const priority = (formData.get('priority') as string) ?? 'medium'
  const dueDateRaw = (formData.get('dueDate') as string) ?? ''
  const db = getDb()

  await db.insert(tasks).values({
    id: createId(),
    title,
    description,
    priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
    completed: false,
    dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/apps/tasks')
}

export async function toggleTask(id: string, completed: boolean) {
  const db = getDb()
  await db.update(tasks).set({ completed, updatedAt: new Date() }).where(eq(tasks.id, id))
  revalidatePath('/apps/tasks')
}

export async function updateTask(id: string, formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const description = (formData.get('description') as string) ?? ''
  const priority = (formData.get('priority') as string) ?? 'medium'
  const dueDateRaw = (formData.get('dueDate') as string) ?? ''
  const completed = (formData.get('completed') as string) === 'on'
  const db = getDb()

  await db
    .update(tasks)
    .set({
      title,
      description,
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      completed,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))

  revalidatePath('/apps/tasks')
  revalidatePath(`/apps/tasks/${id}`)
}

export async function deleteTask(id: string) {
  const db = getDb()
  await db.delete(tasks).where(eq(tasks.id, id))
  revalidatePath('/apps/tasks')
}
