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
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'notes_',
  },
})
