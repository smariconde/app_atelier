# apps/habits/

Habits app workspace package.

## Manifest

- **id / subdomain**: `habits` → `habits.localhost:3000` in dev
- **tablePrefix**: `habits_` (all table names must start with this)
- Edit `manifest.ts` to set `icon`, `color`, `description`, `pwa.themeColor`

## Database schema

`db/schema.ts` — define Drizzle tables here. Table names must start with `habits_`.

## UI routes

Pages live in `app/apps/habits/`:
- `page.tsx` — main list/home view
- `actions.ts` — `'use server'` CRUD server actions
- `[id]/page.tsx` — detail/edit view (add if needed)

## Next steps to complete setup

1. Edit `manifest.ts` — set icon, color, description
2. Add import to `app/manifest.ts` registry
3. Add to `app/apps/hub/page.tsx` apps array
4. Define schema in `db/schema.ts`
5. Run `pnpm db:setup`
6. Run `pnpm generate-icons --app habits --input <1024px.png>`
7. Implement `app/apps/habits/page.tsx` and `actions.ts`
