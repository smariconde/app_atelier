import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { buildPWAManifest } from '@hub/pwa'
import type { AppManifest } from '@hub/core'
import hubApp from '../apps/hub/manifest'
import notesApp from '../apps/notes/manifest'
import tasksApp from '../apps/tasks/manifest'
import habitsApp from '../apps/habits/manifest'
import dailyBriefingApp from '../apps/daily-briefing/manifest'

export const registry: Record<string, AppManifest> = {
  hub: hubApp,
  notes: notesApp,
  tasks: tasksApp,
  habits: habitsApp,
  'daily-briefing': dailyBriefingApp,
}

export function resolveApp(host: string): AppManifest {
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')
  let id = 'hub'
  if (hostname.endsWith('.localhost') && parts.length > 1) id = parts[0]
  else if (parts.length >= 3) id = parts[0]
  return registry[id] ?? registry.hub
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const h = await headers()
  const host = h.get('host') ?? ''
  return buildPWAManifest(resolveApp(host))
}
