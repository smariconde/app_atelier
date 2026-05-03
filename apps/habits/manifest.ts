import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'habits',
  subdomain: 'habits',
  name: 'Habits',
  description: 'Track daily habits and build streaks',
  icon: 'repeat-2',
  color: '#F43F5E',
  enabled: true,
  status: 'stable',
  pwa: {
    themeColor: '#F43F5E',
    backgroundColor: '#09090B',
    display: 'standalone',
  },
  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'habits_',
  },
})
