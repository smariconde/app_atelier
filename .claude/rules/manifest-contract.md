# Rule — App manifest contract

Every app exports a default `AppManifest` from `apps/<appId>/manifest.ts` using `defineManifest` from `@hub/core`. This file is the single source of truth for the hub launcher, the PWA system, and (future) AI context.

## Required fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Must equal `<appId>` (the directory name) |
| `subdomain` | string | Must equal `<appId>` |
| `name` | string | Display name shown in the hub |
| `icon` | string | Lucide icon name in kebab-case (e.g. `'check-circle'`) |
| `color` | string | Brand hex (e.g. `'#10b981'`) |
| `description` | string | One-sentence description |
| `enabled` | boolean | `true` to appear in the hub |
| `status` | `'experimental' \| 'beta' \| 'stable'` | Hub displays this badge |
| `database.tablePrefix` | string | `<appId>_` — see `db-schema.md` |
| `database.schemaPath` | string | Always `'./db/schema.ts'` |
| `pwa` | object | See `pwa.md` |

## Optional fields

| Field | Notes |
|---|---|
| `mcpServers` | Array of MCP server IDs (see `mcp-integrator` agent for known IDs) |
| `aiContext` | Free-form string used by future AI features |

## Edit rules

- Use `Edit` for targeted changes — never `Write` over an existing manifest.
- When changing `color`, also update `pwa.themeColor` to match.
- `id` and `subdomain` are immutable after scaffold — changing them breaks routing.
- Never modify `apps/_template/manifest.ts` or `apps/hub/manifest.ts`.

## Canonical example

`apps/notes/manifest.ts` is the reference. Read it before producing a new manifest.
