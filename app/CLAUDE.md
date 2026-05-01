# app/ — Next.js App Router

This is the Next.js application root. All UI lives here.

## Root files

| File | Purpose |
|---|---|
| `layout.tsx` | HTML shell — sets `lang="en"`, applies `class="dark"`, imports `globals.css` |
| `globals.css` | Tailwind directives + CSS custom properties for shadcn/ui color tokens |
| `manifest.ts` | Dynamic PWA manifest — reads `Host` header, selects app from registry, calls `buildPWAManifest` |
| `sw.ts` | Serwist service worker source — compiled to `public/sw.js` on `pnpm build` only |

## Routing

Middleware rewrites every request before it reaches the router:

```
localhost:3000          →  /apps/hub/...
notes.localhost:3000    →  /apps/notes/...
```

So `app/apps/hub/page.tsx` handles `localhost:3000` and `app/apps/notes/page.tsx` handles `notes.localhost:3000`. There are no `/apps/` URLs visible to the user.

## Adding a new app's routes

```
app/apps/<name>/
  layout.tsx      ← metadata, InstallPrompt
  page.tsx        ← main view (server component)
  actions.ts      ← 'use server' — CRUD server actions
  [id]/
    page.tsx      ← detail view (optional)
```

## Server actions pattern

```typescript
// actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { getDb } from '@hub/db'
import { myTable } from '../../../apps/<name>/db/schema'

export async function createItem(formData: FormData) {
  const db = getDb()
  await db.insert(myTable).values({ ... })
  revalidatePath('/apps/<name>')
}
```

Use `revalidatePath('/apps/<name>')` after mutations — the path matches the internal rewritten route, not the subdomain URL.
