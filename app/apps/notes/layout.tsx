import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Simple personal notes',
}

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
