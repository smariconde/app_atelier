# Architecture

AppAtelier is a single Next.js monorepo where every personal app is an independent PWA at its own subdomain. One deploy, one database connection, zero per-app infrastructure.

---

## Monorepo layout

```
app_atelier/
├── middleware.ts           ← hostname routing — reads Host header, rewrites path
├── next.config.ts          ← Next.js config + Serwist (service worker)
├── vercel.json             ← single Vercel project config
├── lighthouserc.js         ← Lighthouse CI thresholds (≥90 all categories)
│
├── app/                    ← Next.js App Router
│   ├── manifest.ts         ← dynamic PWA manifest (reads Host, picks right app)
│   ├── sw.ts               ← Serwist service worker source
│   └── apps/
│       ├── hub/            ← launcher UI (icon grid only)
│       │   └── page.tsx    ← manifest registry for the icon grid
│       ├── notes/          ← Notes app routes
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── [id]/page.tsx
│       │   └── actions.ts  ← server actions (createNote, updateNote, deleteNote)
│       └── [name]/         ← one directory per app
│
├── apps/                   ← workspace packages (config only, no UI)
│   ├── _template/          ← scaffold source for pnpm new-app
│   └── notes/              ← Notes workspace package
│       ├── manifest.ts     ← defineManifest: id, color, PWA config, DB config
│       └── db/schema.ts    ← Drizzle table definitions
│
├── packages/
│   ├── core/               ← @hub/core: defineManifest, AppManifest type
│   ├── db/                 ← @hub/db: Drizzle ORM + pluggable DB adapter
│   ├── auth/               ← @hub/auth: Better Auth, cross-subdomain SSO
│   ├── ui/                 ← @hub/ui: shadcn/ui components, dark mode, cn()
│   └── pwa/                ← @hub/pwa: buildPWAManifest, InstallPrompt
│
├── scripts/                ← CLI tools (new-app, doctor, generate-icons, audit)
└── .claude/                ← AI Studio (agents + skills)
```

---

## The two-directory app split

Every app lives in two places:

| Directory | Purpose | Imported by |
|---|---|---|
| `apps/notes/` | Workspace package — manifest + DB schema | Hub, `app/manifest.ts`, Drizzle |
| `app/apps/notes/` | Next.js routes — pages, layouts, server actions | Next.js only |

This split is intentional. The manifest must be importable at build time by both the hub (for the icon grid) and `app/manifest.ts` (for the PWA web manifest). Putting Next.js server code there would break those imports.

---

## Middleware hostname routing

`middleware.ts` runs on every request before Next.js handles it. It reads the `Host` header and rewrites the URL path:

```
notes.localhost:3000/         → /apps/notes/
notes.localhost:3000/abc123   → /apps/notes/abc123
localhost:3000/               → /apps/hub/
notes.yourdomain.com/         → /apps/notes/
yourdomain.com/               → /apps/hub/
```

The middleware never redirects — it rewrites internally. The browser URL stays `notes.yourdomain.com`, but Next.js serves `app/apps/notes/page.tsx`.

Static assets (`_next/static`, images, icons, `.webmanifest`) bypass middleware entirely via the `matcher` config.

---

## Package roles

| Package | Exports | Key constraint |
|---|---|---|
| `@hub/core` | `defineManifest`, `AppManifest` type | Zero dependencies |
| `@hub/db` | Drizzle instance, schema utilities | Adapter selected by `DB_ADAPTER` env var |
| `@hub/auth` | `auth` object, session helpers | Cross-subdomain cookie via `domain: .yourdomain.com` |
| `@hub/ui` | shadcn/ui components, `cn()`, Tailwind config | Dark mode default |
| `@hub/pwa` | `buildPWAManifest()`, `<InstallPrompt />` | No Next.js internals |

Packages export source directly (`"exports": { ".": "./src/index.ts" }`). No build step needed for local dev — TypeScript resolves them via `paths` in `tsconfig.json`.

---

## Data flow

A full request cycle for `notes.yourdomain.com/`:

```
Browser
  → DNS: *.yourdomain.com → Vercel edge
  → Vercel → Next.js
  → middleware.ts reads Host "notes.yourdomain.com"
      rewrites pathname / → /apps/notes/
  → app/apps/notes/page.tsx renders (Server Component)
      calls server action getNotes()
      → @hub/db Drizzle client
      → DB_ADAPTER (SQLite / Turso / Postgres / ...)
      ← rows returned
  → React renders HTML
  → streamed to browser
```

---

## The manifest registry

The hub and PWA system both need to know which apps exist. There is no auto-discovery — two files must be updated manually when adding an app (or `pnpm new-app` prints the reminder):

**`app/manifest.ts`** — serves the correct `.webmanifest` response based on the hostname. Maps subdomain → `AppManifest` → `buildPWAManifest()`.

**`app/apps/hub/page.tsx`** — imports all app manifests and renders the icon grid. Each entry contributes an icon tile with the app's name, color, and Lucide icon.

`pnpm doctor` warns if an app directory exists without a corresponding registry entry.

---

## Key constraints

- **One Vercel project** — never create per-app projects
- **Subdomains only** — no path-based routing (`/notes`); every app is at its own subdomain
- **Table prefix always** — every Drizzle table starts with `manifest.database.tablePrefix` (e.g., `notes_notes`)
- **Hub is a launcher** — no widgets, no data, just an icon grid
- **Single user** — no multi-tenancy, no billing
