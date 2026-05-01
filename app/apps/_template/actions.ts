'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@hub/db'
import { items } from '../../../apps/__APP_ID__/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export async function createItem(formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const db = getDb()
  await db.insert(items).values({ id: createId(), title })
  revalidatePath('/apps/__APP_ID__')
}

export async function updateItem(id: string, formData: FormData) {
  const title = (formData.get('title') as string) ?? ''
  const db = getDb()
  await db.update(items).set({ title, updatedAt: new Date() }).where(eq(items.id, id))
  revalidatePath('/apps/__APP_ID__')
  revalidatePath(`/apps/__APP_ID__/${id}`)
}

export async function deleteItem(id: string) {
  const db = getDb()
  await db.delete(items).where(eq(items.id, id))
  revalidatePath('/apps/__APP_ID__')
}
