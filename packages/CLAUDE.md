# packages/ — Shared packages

All packages are internal (`"private": true`) and consumed via workspace protocol (`"@hub/core": "workspace:*"`).

## Resolution

Each package exports its source directly — no build step needed for local dev:
```json
"exports": { ".": "./src/index.ts" }
```
Root `tsconfig.json` has explicit `paths` entries mapping `@hub/*` → `packages/*/src/index.ts` so TypeScript resolves them without compilation.

## tsconfig inheritance

Every package `tsconfig.json` extends `../../tsconfig.base.json`. Add `"jsx": "react-jsx"` for packages with `.tsx` files.

## Package index

| Package | Purpose |
|---|---|
| `@hub/core` | `defineManifest`, `AppManifest` type — no dependencies |
| `@hub/db` | Drizzle ORM + SQLite adapter — see `db/CLAUDE.md` |
| `@hub/auth` | Better Auth with cross-subdomain SSO |
| `@hub/ui` | shadcn/ui components, `cn()` util, Tailwind dark mode |
| `@hub/pwa` | `buildPWAManifest`, `<InstallPrompt />` |

## Adding a new package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Add `"@hub/<name>": "workspace:*"` to any consumer's `package.json`
3. Add path to root `tsconfig.json` paths
4. Add to `transpilePackages` in `next.config.ts`
