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
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: '__APP_ID___',
  },
})
