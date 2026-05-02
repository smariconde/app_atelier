# apps/daily-briefing/

Daily-briefing app workspace package.

## Manifest

- **id / subdomain**: `daily-briefing` → `daily-briefing.localhost:3000` in dev
- **tablePrefix**: `daily-briefing_` (all table names must start with this)
- Edit `manifest.ts` to set `icon`, `color`, `description`, `pwa.themeColor`

## Database schema

`db/schema.ts` — define Drizzle tables here. Table names must start with `daily-briefing_`.

## UI routes

Pages live in `app/apps/daily-briefing/`:
- `page.tsx` — main list/home view
- `actions.ts` — `'use server'` CRUD server actions
- `[id]/page.tsx` — detail/edit view (add if needed)

## Next steps to complete setup

1. Edit `manifest.ts` — set icon, color, description
2. Add import to `app/manifest.ts` registry
3. Add to `app/apps/hub/page.tsx` apps array
4. Define schema in `db/schema.ts`
5. Run `pnpm db:setup`
6. Run `pnpm generate-icons --app daily-briefing --input <1024px.png>`
7. Implement `app/apps/daily-briefing/page.tsx` and `actions.ts`
