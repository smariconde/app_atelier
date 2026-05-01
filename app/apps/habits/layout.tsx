import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'Habits',
  description: 'Track daily habits and build streaks',
}

export default function HabitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
