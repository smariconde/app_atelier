import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import notesApp from '../../../apps/notes/manifest'
import tasksApp from '../../../apps/tasks/manifest'
import habitsApp from '../../../apps/habits/manifest'
import { buildAppUrl, type AppManifest } from '@hub/core'

const apps: AppManifest[] = [notesApp, tasksApp, habitsApp]

type IconName = keyof typeof LucideIcons

function AppIcon({ name, color }: { name: string; color: string }) {
  const pascalName = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')

  const IconComponent = LucideIcons[pascalName as IconName] as React.ComponentType<LucideProps> | undefined

  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
      style={{ backgroundColor: color }}
    >
      {IconComponent ? (
        <IconComponent size={32} className="text-white" />
      ) : (
        <span className="text-white text-2xl font-bold">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

export default function HubPage() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-white">AppAtelier</h1>
        <p className="text-zinc-400 text-sm mt-1">Your personal app platform</p>
      </header>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-6">
        {apps
          .filter((a) => a.enabled)
          .map((app) => {
            const href = buildAppUrl(app.subdomain, domain)

            return (
              <a
                key={app.id}
                href={href}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="transform transition-transform group-hover:scale-105">
                  <AppIcon name={app.icon} color={app.color} />
                </div>
                <span className="text-xs text-zinc-300 text-center">{app.name}</span>
              </a>
            )
          })}
      </div>
    </main>
  )
}
