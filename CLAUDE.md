# CLAUDE.md — AppAtelier

**v1.0 shipped.** One Next.js project, one Vercel deploy, wildcard subdomain routing. Each app is an independent PWA at its own subdomain. The hub at the root domain is a launcher (icon grid only). Full 9-agent studio with MCP support. Deploy with `/deploy-app`; audit Lighthouse scores with `/pwa-audit`.

---

## Commands

```bash
pnpm dev              # hub → localhost:3000, apps → [name].localhost:3000
pnpm build            # production build (enables service workers)
pnpm typecheck        # type-check everything
pnpm lint             # lint everything
pnpm db:setup         # create local.db + all tables (first-time)
pnpm db:reset         # drop + recreate local.db
pnpm new-app <name>   # scaffold a new app from _template
pnpm doctor           # validate all manifests, schemas, PWA configs
pnpm generate-icons   # --input <1024px.png> --app <id> → public/ icons
pnpm audit            # --url <https://yourdomain.com> → Lighthouse scores for all apps
```

---

## How the pieces fit

```
middleware.ts           ← reads Host header, rewrites to /apps/[subdomain]
app/                    ← Next.js App Router (routes, layouts, manifest, SW)
  apps/hub/             ← launcher UI
  apps/[name]/          ← each app's pages and server actions
apps/[name]/            ← workspace package: manifest.ts + db/schema.ts
packages/@hub/core      ← defineManifest, AppManifest type
packages/@hub/db        ← Drizzle ORM + SQLite adapter
packages/@hub/auth      ← Better Auth, cross-subdomain SSO
packages/@hub/ui        ← shadcn/ui components, dark mode
packages/@hub/pwa       ← buildPWAManifest, InstallPrompt
.claude/                ← agents and skills (AI studio)
scripts/                ← new-app, db-*, generate-icons, doctor, audit
lighthouserc.js         ← Lighthouse CI thresholds (≥90 all categories)
vercel.json             ← Vercel project config (single project, Next.js framework)
```

Deeper docs in each directory's own CLAUDE.md.

---

## Key constraints — never break these

- **One Vercel project** — never create per-app Vercel projects
- **Subdomains only** — no path-based routing (`/notes`); every app gets its own subdomain
- **Table prefix always** — every Drizzle schema table must start with `manifest.database.tablePrefix`
- **Hub is a launcher** — no widgets, no dashboard, just an icon grid
- **Single user** — no multi-tenancy, no admin panels, no billing
- **Hub at root domain** — `yourdomain.com` is the launcher; `hub.yourdomain.com` is wrong
