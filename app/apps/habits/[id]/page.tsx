import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@hub/db'
import { habits, entries } from '../../../../apps/habits/db/schema'
import { eq } from 'drizzle-orm'
import { updateHabit, deleteHabit } from '../actions'
import { DeleteButton } from '../delete-button'

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

async function getHabit(id: string) {
  try {
    const db = getDb()
    const result = await db.select().from(habits).where(eq(habits.id, id)).limit(1)
    return result[0] ?? null
  } catch {
    return null
  }
}

async function getRecentEntries(habitId: string) {
  try {
    const db = getDb()
    return await db.select().from(entries).where(eq(entries.habitId, habitId))
  } catch {
    return []
  }
}

export default async function HabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const habit = await getHabit(id)

  if (!habit) notFound()

  const updateHabitWithId = updateHabit.bind(null, id)
  const allEntries = await getRecentEntries(id)
  const completedDates = new Set(
    allEntries.filter((e) => e.completed).map((e) => e.date)
  )

  // Generate last 30 days (newest last, so iterate backwards in the loop)
  const days: { date: string; label: string; completed: boolean }[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow', month: 'short', day: 'numeric' }),
      completed: completedDates.has(dateStr),
    })
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/apps/habits"
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </Link>
      </div>

      <form action={updateHabitWithId} className="space-y-4" id="edit-form">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
        <input
          name="name"
          defaultValue={habit.name}
          placeholder="Habit name"
          className="w-full bg-transparent text-white placeholder-zinc-500 text-2xl font-bold outline-none"
          required
        />
        <input
          name="description"
          defaultValue={habit.description}
          placeholder="Description (optional)"
          className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-base outline-none"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="color" className="text-zinc-400 text-sm">
            Color
          </label>
          <input
            id="color"
            name="color"
            type="color"
            defaultValue={habit.color}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
        </div>

        {/* Mini calendar */}
        <div className="pt-4">
          <h3 className="text-zinc-300 text-sm font-medium mb-3">
            Last 30 days
          </h3>
          <div className="grid grid-cols-10 gap-1.5">
            {days.map((day) => (
              <div
                key={day.date}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: day.completed ? habit.color : '#27272a',
                }}
                title={day.label}
              />
            ))}
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-4">
        <DeleteButton formAction={deleteHabit.bind(null, id)} />
        <button
          type="submit"
          form="edit-form"
          className="text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: habit.color }}
        >
          Save
        </button>
      </div>
    </main>
  )
}
