# apps/ — App workspace packages

Each directory here is a pnpm workspace package containing the app's **config** — manifest and database schema. The actual UI (pages, components) lives in `app/apps/[name]/` (Next.js routes).

## Two-directory split

```
apps/notes/           ← workspace package (@app/notes)
  manifest.ts         ← defineManifest: id, subdomain, icon, color, pwa, database
  db/schema.ts        ← Drizzle table definitions

app/apps/notes/       ← Next.js routes
  layout.tsx
  page.tsx
  [id]/page.tsx
  actions.ts          ← server actions
```

This split lets the manifest be imported by both the hub (for the icon grid) and `app/manifest.ts` (for PWA) without pulling in Next.js server code.

## Manifest registry — manual steps

When adding a new app, you must update these files manually:

1. **`app/manifest.ts`** — add import + registry entry for dynamic PWA manifest
2. **`app/apps/hub/page.tsx`** — add import + apps array entry for the icon grid
3. **`scripts/db-setup.ts`** — add a `CREATE TABLE IF NOT EXISTS` block for the app's table(s). `db:setup` does not auto-discover `db/schema.ts` files.

`pnpm new-app <name>` prints reminders for #1 and #2. `pnpm doctor` will warn if it detects an app directory without a corresponding route.

## _template

`apps/_template/` is the scaffold source for `pnpm new-app`. It uses `__APP_ID__` and `__APP_NAME__` as placeholders. Do not edit it for app-specific logic.
