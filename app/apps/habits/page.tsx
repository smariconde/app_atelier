import Link from 'next/link'
import { getDb } from '@hub/db'
import { habits, entries } from '../../../apps/habits/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createHabit, toggleEntry } from './actions'
import { AppContainer, PageHeader, FormCard, ItemCard, EmptyState } from '@hub/ui'

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getToday(): string {
  return formatDate(new Date())
}

function calculateStreak(entryDates: Set<string>): number {
  let streak = 0
  const d = new Date()

  while (true) {
    const dateStr = formatDate(d)
    if (entryDates.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

async function getHabitsWithEntries() {
  try {
    const db = getDb()
    const allHabits = await db.select().from(habits).orderBy(desc(habits.createdAt))
    const today = getToday()

    const habitsWithData = await Promise.all(
      allHabits.map(async (habit) => {
        const habitEntries = await db
          .select()
          .from(entries)
          .where(eq(entries.habitId, habit.id))

        const completedDates = new Set(
          habitEntries.filter((e) => e.completed).map((e) => e.date)
        )

        const todayEntry = habitEntries.find((e) => e.date === today)

        return {
          ...habit,
          completedToday: todayEntry?.completed ?? false,
          streak: calculateStreak(completedDates),
        }
      })
    )

    return habitsWithData
  } catch {
    return []
  }
}

export default async function HabitsPage() {
  const allHabits = await getHabitsWithEntries()
  const today = getToday()

  return (
    <AppContainer>
      <PageHeader
        title="Habits"
        subtitle={`${allHabits.length} habit${allHabits.length !== 1 ? 's' : ''}`}
      />

      {/* Create form */}
      <form action={createHabit} className="mb-8">
        <FormCard>
          <input
            name="name"
            placeholder="Habit name"
            className="w-full bg-transparent text-white placeholder-zinc-500 text-lg font-medium outline-none mb-2"
            required
          />
          <input
            name="description"
            placeholder="Description (optional)"
            className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-sm outline-none mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="color" className="text-zinc-400 text-sm">
                Color
              </label>
              <input
                id="color"
                name="color"
                type="color"
                defaultValue="#F43F5E"
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-400 text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Add Habit
            </button>
          </div>
        </FormCard>
      </form>

      {/* Habits list */}
      {allHabits.length === 0 ? (
        <EmptyState heading="No habits yet" subtext="Create your first habit above" />
      ) : (
        <ul className="space-y-3">
          {allHabits.map((habit) => (
            <ItemCard key={habit.id} className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: habit.color }}
              />
              <Link
                href={`/apps/habits/${habit.id}`}
                className="flex-1 min-w-0"
              >
                <h2 className="text-white font-medium truncate">
                  {habit.name || 'Unnamed'}
                </h2>
                {habit.description && (
                  <p className="text-zinc-400 text-sm mt-0.5 line-clamp-1">
                    {habit.description}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                {habit.streak > 0 && (
                  <span className="text-zinc-400 text-sm">
                    {habit.streak} 🔥
                  </span>
                )}
                <form action={toggleEntry.bind(null, habit.id, today)}>
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: habit.color,
                      backgroundColor: habit.completedToday
                        ? habit.color
                        : 'transparent',
                    }}
                  >
                    {habit.completedToday && (
                      <svg
                        className="w-5 h-5 text-zinc-950"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </ItemCard>
          ))}
        </ul>
      )}
    </AppContainer>
  )
}
