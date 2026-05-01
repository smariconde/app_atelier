'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  if (installed) return null

  if (deferredPrompt) {
    return (
      <button
        onClick={async () => {
          await deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          if (outcome === 'accepted') setInstalled(true)
          setDeferredPrompt(null)
        }}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      >
        Install App
      </button>
    )
  }

  if (isIOS() && !isInStandaloneMode()) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          Install App
        </button>
        {showIOSModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
            <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-semibold text-lg mb-3">Install on iOS</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Tap the <strong>Share</strong> button in Safari</li>
                <li>2. Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>3. Tap <strong>Add</strong> to confirm</li>
              </ol>
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}
