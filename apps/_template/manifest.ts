import { defineManifest } from '@hub/core'

export default defineManifest({
  id: '__APP_ID__',
  subdomain: '__APP_ID__',
  name: '__APP_NAME__',
  description: '__APP_NAME__ app',
  icon: 'square',
  color: '#6366F1',
  enabled: true,
  status: 'beta',
  pwa: {
    themeColor: '#6366F1',
    backgroundColor: '#09090B',
    display: 'standalone',
    icons: [
      { src: '/__APP_ID__-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/__APP_ID__-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/__APP_ID__-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: '__APP_ID___',
  },
})
