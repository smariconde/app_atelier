import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@hub/db'
import { notes } from '../../../../apps/notes/db/schema'
import { eq } from 'drizzle-orm'
import { updateNote, deleteNote } from '../actions'

async function getNote(id: string) {
  try {
    const db = getDb()
    const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1)
    return result[0] ?? null
  } catch {
    return null
  }
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const note = await getNote(id)

  if (!note) notFound()

  const updateNoteWithId = updateNote.bind(null, id)

  return (
    <main className="min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/apps/notes"
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </Link>
      </div>

      <form action={updateNoteWithId} className="space-y-4">
        <input
          name="title"
          defaultValue={note.title}
          placeholder="Title"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-2xl font-bold outline-none"
        />
        <textarea
          name="content"
          defaultValue={note.content}
          placeholder="Write something..."
          rows={16}
          className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-base outline-none resize-none"
        />
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <form action={deleteNote.bind(null, id)}>
            <button
              type="submit"
              className="text-red-500 hover:text-red-400 text-sm transition-colors"
              onClick={(e) => {
                if (!confirm('Delete this note?')) e.preventDefault()
              }}
            >
              Delete
            </button>
          </form>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  )
}
