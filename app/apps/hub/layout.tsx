import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'AppAtelier',
  description: 'Your personal app launcher',
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<InstallPrompt /></>
}
