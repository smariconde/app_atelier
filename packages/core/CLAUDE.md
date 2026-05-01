# @hub/core

Zero-dependency package. Single source of truth for the manifest contract.

## defineManifest

```typescript
import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'notes',           // unique, lowercase, no spaces
  subdomain: 'notes',    // → notes.yourdomain.com
  name: 'Notes',
  description: 'Simple personal notes',
  icon: 'notebook-pen',  // Lucide icon name (kebab-case)
  color: '#F59E0B',      // hex, used for icon bg in hub
  enabled: true,
  status: 'stable',      // 'stable' | 'beta' | 'experimental'

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
    tablePrefix: 'notes_',   // REQUIRED — all table names must start with this
  },

  // Optional — used by AI studio agents (v0.6+)
  aiContext: {
    description: 'Personal note-taking app',
    domain: 'productivity',
    examples: ['create a note about X', 'find my notes on Y'],
  },
})
```

## The tablePrefix rule

`tablePrefix` is mandatory when `database` is set. Every Drizzle table in the app's schema must be named `<prefix><table>`. Example: prefix `notes_` → table `notes_notes`.

This prevents collisions between apps that share the same SQLite file.

## Manifest registry

The hub reads manifests from `app/manifest.ts` (for PWA) and `app/apps/hub/page.tsx` (for the icon grid). Both must be updated manually when adding a new app — `pnpm new-app` prints the reminder.
