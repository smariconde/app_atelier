import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@hub/db'
import { tasks } from '../../../../apps/tasks/db/schema'
import { eq } from 'drizzle-orm'
import { updateTask, deleteTask } from '../actions'
import { DeleteButton } from '../delete-button'

async function getTask(id: string) {
  try {
    const db = getDb()
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1)
    return result[0] ?? null
  } catch {
    return null
  }
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = await getTask(id)

  if (!task) notFound()

  const updateTaskWithId = updateTask.bind(null, id)

  const dueDateString = task.dueDate
    ? new Date(task.dueDate).toISOString().split('T')[0]
    : ''

  return (
    <main className="min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/apps/tasks" className="text-zinc-400 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
      </div>

      <form id="edit-task" action={updateTaskWithId} className="space-y-4">
        <input
          name="title"
          defaultValue={task.title}
          placeholder="Task title"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-2xl font-bold outline-none"
          required
        />
        <textarea
          name="description"
          defaultValue={task.description}
          placeholder="Description..."
          rows={6}
          className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-base outline-none resize-none"
        />
        <div className="flex items-center gap-3">
          <select
            name="priority"
            defaultValue={task.priority}
            className="bg-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none border border-zinc-700"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            name="dueDate"
            type="date"
            defaultValue={dueDateString}
            className="bg-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none border border-zinc-700"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-300 ml-auto">
            <input
              name="completed"
              type="checkbox"
              defaultChecked={task.completed}
              className="w-4 h-4 accent-emerald-500"
            />
            Completed
          </label>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <DeleteButton formAction={deleteTask.bind(null, id)} />
          <button
            form="edit-task"
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  )
}
