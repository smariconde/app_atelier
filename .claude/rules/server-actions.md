# Rule — Server actions

All data mutations in AppAtelier apps use Next.js Server Actions (`'use server'`). No API routes.

## File location

`app/apps/<appId>/actions.ts` — every action in one file unless the app is large enough to warrant splitting by domain.

## Required patterns

```typescript
'use server'
import { revalidatePath } from 'next/cache'
import { getDb } from '@hub/db'
import { myTable } from '../../../apps/<appId>/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
```

## revalidatePath rule (critical)

Always use the internal Next.js route path, not the subdomain URL:

```typescript
revalidatePath('/apps/<appId>')  // ✓ internal route
revalidatePath('/')              // ✗ invalidates the hub
revalidatePath('https://...')   // ✗ subdomain URLs don't work
```

## Schema import path

The three-dot relative path from `app/apps/<appId>/` to `apps/<appId>/db/schema` is non-obvious. Getting it wrong produces a silent type error at build time:

```typescript
import { myTable } from '../../../apps/<appId>/db/schema'  // ✓
import { myTable } from '@/apps/<appId>/db/schema'          // ✗ no alias
```

## Delete and update actions

Both delete and update actions must redirect after `revalidatePath`, otherwise the deleted item's detail page re-renders and triggers `notFound()` (delete), or the user stays stuck on the edit form with no feedback (update):

```typescript
export async function deleteItem(id: string) {
  const db = getDb()
  await db.delete(myTable).where(eq(myTable.id, id))
  revalidatePath('/apps/<appId>')
  redirect('/apps/<appId>')
}

export async function updateItem(id: string, formData: FormData) {
  const db = getDb()
  await db.update(myTable)...
  revalidatePath('/apps/<appId>')
  revalidatePath(`/apps/<appId>/${id}`)
  redirect('/apps/<appId>')
}
```

Import `redirect` from `'next/navigation'`.

## FormData conventions

- Use `formData.get('fieldName') as string` — field name must match the HTML `name` attribute exactly.
- A mismatch produces an empty string in the database, not an error.

## Never do

- Never create API routes (`app/api/`) — use server actions.
- Never use `useEffect` or client-side `fetch` for data that can be server-rendered.
- Never use `useState` for simple CRUD form state.
- Never import from `@hub/auth` — auth is not enforced yet.
