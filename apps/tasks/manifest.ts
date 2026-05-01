import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'tasks',
  subdomain: 'tasks',
  name: 'Tasks',
  description: 'Personal task manager with priorities',
  icon: 'list-checks',
  color: '#10B981',
  enabled: true,
  status: 'beta',
  pwa: {
    themeColor: '#10B981',
    backgroundColor: '#09090B',
    display: 'standalone',
    icons: [
      { src: '/tasks-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/tasks-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/tasks-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'tasks_',
  },
})
