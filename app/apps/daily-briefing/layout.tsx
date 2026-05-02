import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'Daily Briefing',
  description: 'AI-powered summary of your Gmail and Calendar',
}

export default function DailyBriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
