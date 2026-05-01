# 🧩 AppAtelier

> *"The future isn't just big generic apps. It's ultra-niche, ultra-personalized apps that each individual can create for their exact needs — with no design compromises."*
> — Naval Ravikant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude%20Code-8a2be2)](https://claude.com/claude-code)
[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)

---

## The paradigm shift

For decades, software worked like this: a company builds a generic app, millions of people adapt their behavior to fit it.

That's ending.

AI makes it possible — for anyone, not just developers — to have software built exactly for them. No feature bloat from other people's use cases. No compromises. An exercise tracker that reads the specific studies you care about and calculates strength scores the way *you* define them. A reading log that works exactly the way your brain organizes books. A finance dashboard built around your actual financial life, not some product manager's assumption of what your financial life looks like.

Naval calls these **"one-shot apps"** — personal software created in a single conversation with an AI, installed on your phone like any other app, used only by you. Your own private App Store, where every app was designed for an audience of one.

**AppAtelier is the infrastructure for that paradigm.** It's the platform that turns "I want an app that does X" into an installable app on your home screen, in minutes, with no compromises.

---

## What it is

A clonable template that gives you:

- A **web launcher** at `yourdomain.com` — a minimal home screen with icons for every app you've built
- A **PWA per app** — each at its own subdomain (`notes.yourdomain.com`, `fitness.yourdomain.com`), individually installable on mobile like a real app
- An **AI studio** — a team of specialized Claude agents that takes a plain-language brief and produces a working, deployed app: `"I want an app to track my sleep quality correlated with what I ate"` → installable PWA, live in minutes
- A **single deploy** — one Vercel project, one wildcard DNS record, and every app you ever create is automatically available at its subdomain. No per-app infrastructure.

The target user is **anyone who wants software that fits their life exactly** — and is willing to describe what they want to an AI.

---

## The experience

```
You describe what you want, in plain language:

  "I want a workout tracker that scores my sessions based on
   progressive overload, not just calories burned. It should
   pull from Apple Health and show me a weekly strength trend."

The studio builds it:

  Product Lead  →  turns your brief into a spec
  Design Lead   →  picks the icon, colors, layout
  App Builder   →  writes the code
  PWA Specialist →  makes it installable
  QA Auditor    →  validates it passes standards
  Deployer      →  pushes it live

You open yourdomain.com.
There's a new icon. You tap it.
Your phone asks if you want to add it to your home screen.
You say yes.

That's your app. Built for you. Runs like a native app.
No App Store. No subscription. No compromise.
```

---

## How it works technically

**One Next.js project serves everything.** Next.js middleware reads the hostname and routes each request to the right app internally:

```
yourdomain.com        →  middleware  →  /apps/hub  (the launcher)
notes.yourdomain.com  →  middleware  →  /apps/notes
tasks.yourdomain.com  →  middleware  →  /apps/tasks
```

From the browser's perspective, each subdomain is a fully independent PWA — its own manifest, its own service worker, its own storage, its own install prompt. From your infrastructure perspective, it's one repo and one deploy.

When you add a new app and redeploy, it appears at its subdomain automatically. No new Vercel projects, no new DNS records, no configuration.

```
DNS: yourdomain.com + *.yourdomain.com → Vercel (one project)
                               │
                    ┌──────────▼──────────┐
                    │   Next.js middleware │
                    │   routes by hostname │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
yourdomain.com        notes.yourdomain.com    fitness.yourdomain.com
Web launcher          Independent PWA         Independent PWA
(icon grid)           own SW, storage,        own SW, storage,
                      installable             installable
       │                       │                       │
       └───────────────────────┴───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Shared backend     │
                    │   Drizzle ORM        │
                    │   Better Auth (SSO)  │
                    │   SQLite → Postgres  │
                    └─────────────────────┘
```

---

## The AI Studio

Inspired by [Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) — the idea that complex creative work benefits from a *team* of specialized agents rather than one generalist — but adapted for building personal software.

The studio lives in `.claude/` and consists of agents, skills, and hooks:

**Leads** coordinate at the product and design level:

| Agent | What it does |
|---|---|
| `product-lead` | Turns a plain-language brief into a concrete spec: schema, routes, integrations |
| `tech-lead` | Decides implementation details: packages, MCP integrations, patterns |
| `design-lead` | Defines the app's visual identity: palette, icon, typography, layout feel |

**Specialists** execute the concrete work:

| Agent | What it does |
|---|---|
| `app-architect` | Scaffolds the app folder from the template |
| `app-builder` | Writes pages, components, and server actions |
| `pwa-specialist` | Configures manifest, service worker, install prompt, icon set |
| `db-migrator` | Defines the schema, runs migrations, manages table prefixes |
| `ui-designer` | Implements the UI following the design lead's identity |
| `deployer` | Handles Vercel deploy and subdomain routing |
| `qa-auditor` | Runs Lighthouse, validates the PWA manifest, checks a11y |

**Skills** are the workflows that orchestrate agents:

| Skill | Triggers when |
|---|---|
| `/create-app` | "I want an app that..." / "Build me a..." |
| `/modify-app` | "Change the way X works" / "Add Y to my app" |
| `/theme-app` | "Make it feel more like..." / "Change the colors to..." |
| `/deploy-app` | "Ship it" / "Push to production" |
| `/pwa-audit` | "Is it installable?" / "Check the PWA score" |
| `/add-mcp` | "Connect it to my Google Calendar" / "Pull from Notion" |

You stay in control. Every spec gets your approval before code is written. Every deploy gets your sign-off. The agents do the work; you make the decisions.

---

## Quick start

### Local development

```bash
git clone https://github.com/<you>/appatelier.git
cd appatelier
pnpm install
cp .env.example .env
pnpm db:setup
pnpm dev
```

`localhost:3000` is your hub. `notes.localhost:3000` is the Notes example app, installable as a PWA from your local machine.

### Production (one-time setup)

```bash
# Deploy everything — one command
vercel --prod

# In your DNS provider: two records
# Apex:     yourdomain.com     →  A record to Vercel's IPs (or ALIAS/ANAME)
# Wildcard: *.yourdomain.com   →  cname.vercel-dns.com

# In Vercel dashboard: add both yourdomain.com and *.yourdomain.com as custom domains
# The wildcard covers every app you'll ever create — no changes needed per new app
```

> **Using Vercel's domain instead of a custom one?** Your hub lives at `yourproject.vercel.app`. Add `*.yourproject.vercel.app` in the Vercel dashboard to cover all app subdomains.

After this, creating a new app and running `vercel --prod` again makes it live at its subdomain. No additional infrastructure steps, ever.

### Creating your first custom app

With Claude Code open in the repo, just describe what you want:

> "I want a personal finance tracker that separates expenses by life area — work, health, home — and shows me a monthly trend for each. Nothing fancy, just clear numbers."

The studio takes it from there. You approve the spec, the agents build and deploy. Five to ten minutes later, there's a new icon on `yourdomain.com` and the app is on your phone's home screen.

Or scaffold manually and build it yourself:

```bash
pnpm new-app finance --interactive
```

---

## The manifest contract

Every app declares a `manifest.ts` that the hub reads for discovery, the studio reads for context, and the PWA system reads for installability. It's the single source of truth for an app's identity:

```typescript
import { defineManifest } from '@hub/core';

export default defineManifest({
  id: 'fitness',
  name: 'Fitness',
  description: 'Strength tracker with progressive overload scoring',
  version: '0.1.0',

  icon: 'dumbbell',
  color: '#6366F1',
  subdomain: 'fitness',     // → fitness.yourdomain.com

  enabled: true,
  status: 'stable',

  pwa: {
    themeColor: '#6366F1',
    backgroundColor: '#09090B',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', purpose: 'maskable' },
    ],
  },

  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'fitness_',   // prevents collisions with other apps
    migrations: './db/migrations',
  },

  // Plain-language context so the studio understands the app
  aiContext: {
    description: 'Tracks workouts with progressive overload scoring and strength trends',
    domain: 'health',
    examples: [
      'Log today\'s bench press: 3x8 at 80kg',
      'Show my strength trend for squats this month',
      'Did I hit progressive overload this week?',
    ],
  },
});
```

See [`docs/creating-apps.md`](docs/creating-apps.md) for the full reference.

---

## Deployment model

One question that always comes up: *"do I need a separate Vercel project per app?"*

No. Everything runs as a single project.

| Approach | Vercel projects | PWAs independent? | Setup per new app |
|---|---|---|---|
| Paths (`/notes`, `/tasks`) | 1 | ❌ Shared install, shared storage | None |
| **Middleware routing** *(this project)* | **1** | **✅ Each app is its own origin** | **None** |
| One project per app | N | ✅ | Create project, configure domain |

Middleware routing gives you the infrastructure simplicity of a single project with the full PWA isolation of separate origins. The browser treats `notes.yourdomain.com` and `fitness.yourdomain.com` as completely independent apps — because they are, from an origin perspective. The shared deployment is invisible.

---

## Backend options

The default is local SQLite — no accounts, no configuration, works immediately. When you're ready to sync across devices or add reliability, swap with one env variable:

| Stage | Backend | Config |
|---|---|---|
| Start here | SQLite (local) | `DB_ADAPTER=sqlite` (default) |
| Multi-device | Turso | `DB_ADAPTER=turso` + URL |
| Supabase user | Postgres | `DB_ADAPTER=postgres` + URL |
| Cloudflare | D1 | `DB_ADAPTER=d1` + binding |

Auth (Better Auth) follows the same pattern. Cross-subdomain SSO works out of the box — log in once at `yourdomain.com`, and all your apps know who you are. See [`docs/backend-options.md`](docs/backend-options.md).

---

## PWA details

Every app is a real installable PWA:

- **Subdomain isolation** — each app has its own origin, service worker, storage, and permissions. Uninstalling Notes doesn't touch Fitness.
- **Native Next.js 15 manifest** — no third-party dependencies, uses the official `app/manifest.ts` API
- **Serwist** for service workers — the maintained successor to `next-pwa`
- **Cross-platform install prompt** — native on Chrome/Edge/Android; manual steps UI on Safari iOS (the limitation is Apple's, not ours)
- **Auto-generated icon set** — give the studio a 1024×1024 image, it produces the full set including maskable variants
- **Lighthouse-gated** — the `qa-auditor` agent won't sign off on a deploy with a PWA score below 90

See [`docs/pwa-deep-dive.md`](docs/pwa-deep-dive.md).

---

## Documentation

- [Getting Started](docs/getting-started.md) — Prerequisites, setup, first run
- [Architecture](docs/architecture.md) — How the pieces fit together
- [Creating Apps](docs/creating-apps.md) — Manifest contract, schema, app structure
- [AI Studio](docs/ai-studio.md) — The agent system, skills, and workflows
- [PWA Deep Dive](docs/pwa-deep-dive.md) — Manifests, service workers, install
- [Theming](docs/theming.md) — Visual identity and personalization
- [Deployment](docs/deployment.md) — Single Vercel project, wildcard DNS, self-hosted
- [Backend Options](docs/backend-options.md) — Choosing and switching backends

---

## What this is not

- ❌ Not a SaaS template — there's one user (you). For multi-tenant products, use [Makerkit](https://makerkit.dev)
- ❌ Not a homelab dashboard — for link launchers, use [Dashy](https://dashy.to)
- ❌ Not a Notion replacement — for general-purpose knowledge tools, use Notion
- ❌ Not a marketplace — your apps are yours, not distributed to others
- ❌ Not for developers specifically — the target is anyone who can describe what they want

---

## Roadmap

See [ROADMAP.md](ROADMAP.md).

- ✅ **v0.1** — Foundation: manifest + PWA contract, hub launcher, middleware routing
- 🚧 **v0.2** — Studio v0: 4 core agents, `/create-app` skill end-to-end
- 📋 **v0.3** — Studio v1: full 7-agent team, 7 skills, validation hooks
- 📋 **v0.4** — Deploy automation: `pnpm ship`, DNS guide, self-hosted option
- 📋 **v0.5** — Backend adapters: Postgres, Turso, D1, MySQL all stable
- 🎯 **v1.0** — Stable contracts, full docs, community-ready

---

## Contributing

The most useful contributions right now:

- **New example apps** — real apps you've built for yourself, showing what the paradigm enables
- **New agent definitions** — specialists for domains the studio doesn't cover yet
- **New skills** — workflows you find yourself doing repeatedly
- **Non-Vercel deploy docs** — Coolify, Dokploy, Fly.io, self-hosted guides

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — build whatever you want for yourself.

---

## Prior art and inspiration

- **Naval Ravikant** — for articulating the paradigm this project is built around
- **[Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)** — the hierarchical agent studio model
- **[shadcn/ui](https://ui.shadcn.com)** — for the "components live in your repo" philosophy
- **[Anthropic Skills](https://code.claude.com/docs/en/skills)** — the AI extension model that makes the studio possible
- **[web.dev](https://web.dev/articles/building-multiple-pwas-on-the-same-domain)** — for the multi-PWA subdomain architecture

---

*The App Store era gave everyone access to the same apps. The AI era gives everyone access to their own.*
