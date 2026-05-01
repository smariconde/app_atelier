'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@hub/db'
import { notes } from '../../../apps/notes/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function createNote(formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const content = (formData.get('content') as string) ?? ''
  const db = getDb()

  await db.insert(notes).values({
    id: createId(),
    title,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/apps/notes')
}

export async function updateNote(id: string, formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const content = (formData.get('content') as string) ?? ''
  const db = getDb()

  await db
    .update(notes)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(notes.id, id))

  revalidatePath('/apps/notes')
  revalidatePath(`/apps/notes/${id}`)
}

export async function deleteNote(id: string) {
  const db = getDb()
  await db.delete(notes).where(eq(notes.id, id))
  revalidatePath('/apps/notes')
}
