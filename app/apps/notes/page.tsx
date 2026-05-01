import Link from 'next/link'
import { getDb } from '@hub/db'
import { notes } from '../../../apps/notes/db/schema'
import { desc } from 'drizzle-orm'
import { createNote } from './actions'

async function getNotes() {
  try {
    const db = getDb()
    return await db.select().from(notes).orderBy(desc(notes.createdAt))
  } catch {
    // Table may not exist yet — return empty list
    return []
  }
}

export default async function NotesPage() {
  const allNotes = await getNotes()

  return (
    <main className="min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-zinc-400 text-sm mt-1">{allNotes.length} note{allNotes.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      {/* Create form */}
      <form action={createNote} className="mb-8 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <input
          name="title"
          placeholder="Title"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-lg font-medium outline-none mb-2"
          required
        />
        <textarea
          name="content"
          placeholder="Write something..."
          rows={3}
          className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-sm outline-none resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Add Note
          </button>
        </div>
      </form>

      {/* Notes list */}
      {allNotes.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-1">Create your first note above</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {allNotes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/apps/notes/${note.id}`}
                className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 transition-colors"
              >
                <h2 className="text-white font-medium truncate">
                  {note.title || 'Untitled'}
                </h2>
                {note.content && (
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{note.content}</p>
                )}
                <p className="text-zinc-600 text-xs mt-2">
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
