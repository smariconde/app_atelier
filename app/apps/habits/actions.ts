'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@hub/db'
import { habits, entries } from '../../../apps/habits/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function createHabit(formData: FormData) {
  const name = (formData.get('name') as string) ?? ''
  const description = (formData.get('description') as string) ?? ''
  const color = (formData.get('color') as string) ?? '#F43F5E'
  const db = getDb()

  await db.insert(habits).values({
    id: createId(),
    name,
    description,
    color,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/apps/habits')
}

export async function updateHabit(id: string, formData: FormData) {
  const name = (formData.get('name') as string) ?? ''
  const description = (formData.get('description') as string) ?? ''
  const color = (formData.get('color') as string) ?? '#F43F5E'
  const db = getDb()

  await db
    .update(habits)
    .set({ name, description, color, updatedAt: new Date() })
    .where(eq(habits.id, id))

  revalidatePath('/apps/habits')
  revalidatePath(`/apps/habits/${id}`)
  redirect('/apps/habits')
}

export async function deleteHabit(id: string) {
  const db = getDb()
  await db.delete(entries).where(eq(entries.habitId, id))
  await db.delete(habits).where(eq(habits.id, id))
  revalidatePath('/apps/habits')
  redirect('/apps/habits')
}

export async function toggleEntry(habitId: string, date: string) {
  const db = getDb()

  const existing = await db
    .select()
    .from(entries)
    .where(and(eq(entries.habitId, habitId), eq(entries.date, date)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(entries)
      .set({ completed: !existing[0].completed })
      .where(eq(entries.id, existing[0].id))
  } else {
    await db.insert(entries).values({
      id: createId(),
      habitId,
      date,
      completed: true,
      createdAt: new Date(),
    })
  }

  revalidatePath('/apps/habits')
  revalidatePath(`/apps/habits/${habitId}`)
}
