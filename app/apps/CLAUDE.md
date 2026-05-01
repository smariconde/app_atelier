# app/apps/ — App routes

Each subdirectory is the Next.js route for one app. The subdomain-to-route mapping is handled by `middleware.ts` at the root — nothing here needs to know about subdomains.

## Directory per app

```
hub/          ← launcher (root domain)
notes/        ← notes app (notes.* subdomain)
<name>/       ← new app (created by pnpm new-app)
```

## Conventions

- **`layout.tsx`** — set `metadata.title`, include `<InstallPrompt />` from `@hub/pwa`
- **`page.tsx`** — server component; fetch data directly, no API routes needed
- **`actions.ts`** — `'use server'` file; all mutations go here
- **`[id]/page.tsx`** — detail/edit view; receive `params` as `Promise<{ id: string }>` (Next.js 15)

## revalidatePath

Always use the **internal path** (after middleware rewrite), not the subdomain URL:
```typescript
revalidatePath('/apps/notes')      // ✓ correct
revalidatePath('/')                // ✗ wrong — that's the hub
```

## Linking within an app

Use Next.js `<Link href="/apps/notes/[id]">` for internal navigation. The middleware only rewrites the entry request; subsequent client-side navigation uses the internal paths.

For **cross-app links** (hub → notes), use full URLs: `http://notes.localhost:3000` in dev or `https://notes.yourdomain.com` in prod, built from `NEXT_PUBLIC_DOMAIN`.
