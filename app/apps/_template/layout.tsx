import type { Metadata } from 'next'
import { InstallPrompt } from '@hub/pwa'

export const metadata: Metadata = {
  title: '__APP_NAME__',
  description: '__APP_DESCRIPTION__',
}

export default function __APP_NAME__Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
