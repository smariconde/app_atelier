# AGENTS.md — AppAtelier

Compact reference for OpenCode sessions. Every line should prevent a mistake.

---

## Commands

```bash
pnpm dev              # hub → localhost:3000, apps → [name].localhost:3000
pnpm build            # production build via turbo (enables Serwist SW)
pnpm typecheck        # turbo typecheck across packages + app
pnpm lint             # turbo lint across packages + app
pnpm db:setup         # create local.db + tables (first-time or after schema changes)
pnpm db:reset         # drop + recreate local.db
pnpm new-app <name>   # scaffold from _template; still requires 2 manual registry edits
pnpm doctor           # validate manifests, routes, packages exist
pnpm generate-icons   # --input <1024px.png> --app <id> → public/ icons
```

**No test runner is configured.** There are no `test`, `jest`, or `vitest` commands.

---

## Verification order (match CI)

CI runs: `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm build`.

`turbo.json` defines `typecheck` as depending on `^build`, so build artifacts must be present before typecheck in some cases.

---

## Monorepo boundaries

**Package manager:** pnpm (`pnpm-workspace.yaml` includes `packages/*` and `apps/*`).
**Task runner:** Turbo.

| Directory | What lives here |
|---|---|
| `app/` | Next.js App Router — layouts, pages, server actions, global manifest, SW |
| `app/apps/[name]/` | Next.js routes for each app (UI only) |
| `apps/[name]/` | Workspace package — `manifest.ts` + `db/schema.ts` |
| `packages/@hub/*` | Shared internal packages consumed via `workspace:*` |

**Critical:** `apps/notes/` (manifest + schema) and `app/apps/notes/` (pages + actions) are **different directories**. Do not confuse them.

Packages export source directly (`"exports": { ".": "./src/index.ts" }`). There is **no `dist/` build step** for packages. Root `tsconfig.json` maps `@hub/*` → `packages/*/src/index.ts`, and `next.config.ts` lists them in `transpilePackages`.

When adding a new `@hub/*` package, you must update **both** `tsconfig.json` paths and `next.config.ts` `transpilePackages`.

---

## Subdomain routing

`middleware.ts` rewrites based on the `Host` header before the router sees the request:

```
localhost:3000        →  /apps/hub/...
notes.localhost:3000  →  /apps/notes/...
```

Users never see `/apps/` in the URL. Internal navigation inside an app uses `/apps/[name]/...` paths. Cross-app links must use full URLs (`http://notes.localhost:3000`).

---

## Adding a new app

1. `pnpm new-app <name>` scaffolds `apps/<name>/` and `app/apps/<name>/`.
2. **Manually edit two files** (the script prints reminders):
   - `app/manifest.ts` — add import + registry entry
   - `app/apps/hub/page.tsx` — add import + `apps` array entry
3. Define schema in `apps/<name>/db/schema.ts`.
4. **Add the app's `CREATE TABLE` to `scripts/db-setup.ts`** — this is required because `db:setup` does not auto-discover schema files.
5. Run `pnpm db:setup`.
6. Run `pnpm generate-icons --app <id> --input <1024px.png>`.

`pnpm doctor` will warn if an app directory exists without a matching route.

---

## Database

- **Default:** SQLite via `better-sqlite3`, file at `./local.db` (controlled by `DATABASE_URL`).
- **Setup:** `pnpm db:setup` runs raw `CREATE TABLE IF NOT EXISTS` SQL in `scripts/db-setup.ts`.
- **Migrate:** `pnpm db:migrate` is currently a placeholder — it just calls `db:setup`.
- **Reset:** `pnpm db:reset` deletes `local.db` (and WAL/SHM) then re-runs setup.

**Critical — manual step:** `db:setup` does **not** read `apps/*/db/schema.ts` automatically. Every time you add a new app (or change an existing table), you must edit `scripts/db-setup.ts` and add the corresponding `CREATE TABLE IF NOT EXISTS` block. This is a v0.1 limitation until a real migration tool (e.g., drizzle-kit) is wired up.

**Table prefix rule:** Every Drizzle table name must start with the app's `manifest.database.tablePrefix`. Example: prefix `notes_` → table `notes_notes`. This prevents collisions in the shared SQLite file.

Schema imports from `drizzle-orm/sqlite-core` in v0.1. IDs use `@paralleldrive/cuid2`.

---

## Server actions

Mutations live in `app/apps/[name]/actions.ts` (`'use server'`).

After mutations, call:

```typescript
revalidatePath('/apps/<name>')   // internal rewritten path
```

Do **not** use `'/'` or the subdomain URL — revalidation must target the internal route.

---

## Service workers

Serwist compiles `app/sw.ts` → `public/sw.js` during `pnpm build` only. Service workers are **disabled in development** (`disable: process.env.NODE_ENV === 'development'`).

---

## Style & conventions

- **Dark mode by default:** Root `layout.tsx` sets `<html className="dark">`. All UI is built for dark mode first.
- **shadcn/ui tokens:** `globals.css` defines HSL custom properties. `tailwind.config.ts` maps them to colors (`border`, `background`, `primary`, etc.).
- **ESLint:** `next/core-web-vitals` only.
- **tsconfig:** Every package `tsconfig.json` extends `../../tsconfig.base.json`. Add `"jsx": "react-jsx"` for packages with `.tsx`.

---

## Auth

Better Auth is configured with cross-subdomain SSO via `COOKIE_DOMAIN`. In local dev, `COOKIE_DOMAIN=localhost` covers `*.localhost`.

Auth infrastructure exists (v0.1) but UI is unenforced and not on the current roadmap. The route handler pattern is documented in `packages/auth/CLAUDE.md`.

---

## Key constraints (never break)

- **One Vercel project** — never create per-app Vercel projects
- **Subdomains only** — no path-based routing (`/notes`); every app gets its own subdomain
- **Table prefix always** — every Drizzle schema table must start with `manifest.database.tablePrefix`
- **Hub is a launcher** — no widgets, no dashboard, just an icon grid
- **Single user** — no multi-tenancy, no admin panels, no billing
- **Hub at root domain** — `yourdomain.com` is the launcher; `hub.yourdomain.com` is wrong

---

## Deeper docs

Each directory has its own `CLAUDE.md` with detailed conventions:
- `CLAUDE.md` — root overview
- `app/CLAUDE.md` — App Router, routing, server actions
- `apps/CLAUDE.md` — workspace packages, two-directory split
- `packages/CLAUDE.md` — shared packages, adding new ones
- `packages/*/CLAUDE.md` — package-specific usage
