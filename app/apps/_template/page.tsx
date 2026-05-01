import { getDb } from '@hub/db'
import { items } from '../../../apps/__APP_ID__/db/schema'
import { desc } from 'drizzle-orm'
import { createItem } from './actions'
import { AppContainer, PageHeader, FormCard, ItemCard, EmptyState } from '@hub/ui'

async function getItems() {
  try {
    const db = getDb()
    return await db.select().from(items).orderBy(desc(items.createdAt))
  } catch {
    return []
  }
}

export default async function __APP_NAME__Page() {
  const allItems = await getItems()

  return (
    <AppContainer>
      <PageHeader
        title="__APP_NAME__"
        subtitle={`${allItems.length} item${allItems.length !== 1 ? 's' : ''}`}
      />

      {/* Create form */}
      <form action={createItem} className="mb-8">
        <FormCard>
          <input
            name="title"
            placeholder="Title"
            className="w-full bg-transparent text-white placeholder-zinc-500 text-lg font-medium outline-none"
            required
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-[--app-color] hover:opacity-90 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Add __APP_NAME__
            </button>
          </div>
        </FormCard>
      </form>

      {/* Items list */}
      {allItems.length === 0 ? (
        <EmptyState heading="No items yet" subtext="Create your first one above" />
      ) : (
        <ul className="space-y-3">
          {allItems.map((item) => (
            <ItemCard key={item.id}>
              <h2 className="text-white font-medium truncate">{item.title || 'Untitled'}</h2>
              <p className="text-zinc-600 text-xs mt-2">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
              </p>
            </ItemCard>
          ))}
        </ul>
      )}
    </AppContainer>
  )
}
