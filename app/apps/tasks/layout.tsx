import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Personal task manager with priorities',
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
