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
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'tasks_',
  },
})
