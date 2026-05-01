import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'notes',
  subdomain: 'notes',
  name: 'Notes',
  description: 'Simple personal notes',
  icon: 'notebook-pen',
  color: '#F59E0B',
  enabled: true,
  status: 'stable',
  pwa: {
    themeColor: '#F59E0B',
    backgroundColor: '#09090B',
    display: 'standalone',
    icons: [
      { src: '/notes-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/notes-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/notes-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'notes_',
  },
})
