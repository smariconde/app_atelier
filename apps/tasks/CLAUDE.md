# apps/_template/

Scaffold source for `pnpm new-app <name>`. Do not add app-specific logic here.

## Placeholders replaced by new-app script

| Placeholder | Replaced with |
|---|---|
| `__APP_ID__` | lowercase app name (e.g. `finance`) |
| `__APP_NAME__` | display name (e.g. `Finance`) |

## After scaffolding

`pnpm new-app <name>` copies this directory to `apps/<name>/` and replaces placeholders. It then reminds you to:

1. Edit `apps/<name>/manifest.ts` — set `icon`, `color`, `description`
2. Add import to `app/manifest.ts` registry
3. Add to `app/apps/hub/page.tsx` apps array
4. Run `pnpm db:setup`
5. Run `pnpm generate-icons --app <name> --input <1024px.png>`
