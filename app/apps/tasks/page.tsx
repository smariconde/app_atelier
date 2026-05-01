import Link from 'next/link'
import { getDb } from '@hub/db'
import { tasks } from '../../../apps/tasks/db/schema'
import { eq, sql, asc, desc } from 'drizzle-orm'
import { createTask, toggleTask, deleteTask } from './actions'
import { DeleteButton } from './delete-button'

async function getTasks() {
  try {
    const db = getDb()
    return await db
      .select()
      .from(tasks)
      .orderBy(
        asc(tasks.completed),
        sql`CASE ${tasks.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`,
        asc(tasks.dueDate)
      )
  } catch {
    return []
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[priority] ?? colors.medium}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export default async function TasksPage() {
  const allTasks = await getTasks()
  const incomplete = allTasks.filter((t) => !t.completed).length

  return (
    <main className="min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {incomplete} incomplete · {allTasks.length - incomplete} done
          </p>
        </div>
      </header>

      {/* Create form */}
      <form action={createTask} className="mb-8 bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
        <input
          name="title"
          placeholder="Task title"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-lg font-medium outline-none"
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows={2}
          className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-sm outline-none resize-none"
        />
        <div className="flex items-center gap-3">
          <select
            name="priority"
            defaultValue="medium"
            className="bg-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none border border-zinc-700"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            name="dueDate"
            type="date"
            className="bg-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none border border-zinc-700"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Tasks list */}
      {allTasks.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-lg">No tasks yet</p>
          <p className="text-sm mt-1">Create your first task above</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {allTasks.map((task) => (
            <li
              key={task.id}
              className={`group bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors ${task.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <form action={toggleTask.bind(null, task.id, !task.completed)} className="mt-0.5">
                  <button
                    type="submit"
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                        : 'border-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </form>
                <div className="flex-1 min-w-0">
                  <Link href={`/apps/tasks/${task.id}`} className="block">
                    <h2 className={`text-white font-medium truncate ${task.completed ? 'line-through text-zinc-400' : ''}`}>
                      {task.title || 'Untitled'}
                    </h2>
                    {task.description && (
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="text-xs text-zinc-500">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton formAction={deleteTask.bind(null, task.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
