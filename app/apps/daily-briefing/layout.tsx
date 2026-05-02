import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: 'Daily Briefing',
  description: 'AI-powered summary of your Gmail and Calendar',
}

export default function DailyBriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        :root {
          --primary: 199 95% 60%;
          --primary-foreground: 222 47% 11%;
          --accent: 199 35% 18%;
          --accent-foreground: 0 0% 98%;
          --ring: 199 95% 60%;
        }
      `}</style>
      {children}
      <InstallPrompt />
    </>
  )
}
