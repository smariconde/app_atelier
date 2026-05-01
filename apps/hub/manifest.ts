import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'hub',
  subdomain: 'hub',
  name: 'AppAtelier',
  description: 'Your personal app launcher',
  icon: 'grid-2x2',
  color: '#6366F1',
  enabled: true,
  status: 'stable',
  pwa: {
    themeColor: '#6366F1',
    backgroundColor: '#09090B',
    display: 'standalone',
    icons: [
      { src: '/hub-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/hub-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/hub-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
})
