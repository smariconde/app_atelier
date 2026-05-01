import { notFound } from 'next/navigation'
import { getDb } from '@hub/db'
import { eq } from 'drizzle-orm'
import { items } from '../../../../apps/__APP_ID__/db/schema'
import { updateItem, deleteItem } from '../actions'
import { AppContainer, PageHeader, DeleteButton } from '@hub/ui'

async function getItem(id: string) {
  try {
    const db = getDb()
    const result = await db.select().from(items).where(eq(items.id, id)).limit(1)
    return result[0] ?? null
  } catch {
    return null
  }
}

export default async function __APP_NAME__ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItem(id)
  if (!item) notFound()

  const updateItemWithId = updateItem.bind(null, id)

  return (
    <AppContainer>
      <PageHeader backHref="/apps/__APP_ID__" />

      <form action={updateItemWithId} className="space-y-4">
        <input
          name="title"
          defaultValue={item.title}
          placeholder="Title"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-2xl font-bold outline-none"
        />

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <DeleteButton
            formAction={deleteItem.bind(null, id)}
            confirmMessage="Delete this item?"
          />
          <button
            type="submit"
            className="bg-[--app-color] hover:opacity-90 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </AppContainer>
  )
}
