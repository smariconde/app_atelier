<div align="center">

# 🧩 AppAtelier

**Build your own private app store. One repo, one deploy, infinite installable PWAs — described in plain language to a team of AI agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/smariconde/app_atelier/actions/workflows/ci.yml/badge.svg)](https://github.com/smariconde/app_atelier/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude%20Code-8a2be2)](https://claude.com/claude-code)
[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![Node.js ≥20](https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js)](https://nodejs.org)
[![pnpm ≥10](https://img.shields.io/badge/pnpm-%E2%89%A510-F69220?logo=pnpm)](https://pnpm.io)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org)

</div>

---

## What is AppAtelier?

AppAtelier is a clonable Next.js template that turns plain-language briefs into installable PWAs. You get a **launcher** at `yourdomain.com`, a **PWA per app** at its own subdomain (`notes.yourdomain.com`, `fitness.yourdomain.com`), and an **AI studio** of 12 specialized Claude agents that scaffolds, builds, themes, and deploys each app from your description.

One repo. One Vercel project. One wildcard DNS record. Every app you'll ever create — automatically live at its subdomain. Built for an audience of one: you.

---

## Quick start

> **Requirements:** Node.js ≥20, pnpm ≥10, [Claude Code](https://claude.com/claude-code) (for the AI studio).

```bash
git clone https://github.com/smariconde/app_atelier.git
cd app_atelier
pnpm install
cp .env.example .env
pnpm db:setup
pnpm dev
```

Open [`localhost:3000`](http://localhost:3000) — that's your hub. The example apps live at `notes.localhost:3000`, `tasks.localhost:3000`, `habits.localhost:3000`, and `daily-briefing.localhost:3000` — each individually installable as a PWA.

---

## Build your first app

With Claude Code open in the repo, run:

```
/create-app
```

Then describe what you want:

> *"A finance tracker that separates expenses by life area — work, health, home — and shows me a monthly trend for each."*

The studio drafts a spec, you approve it, agents build the schema, pages, theme, and PWA. A few minutes later, a new icon appears on your hub and the app is installable on your phone.

Prefer to scaffold manually? `pnpm new-app finance --interactive`.

---

## How it works

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
(icon grid)           own SW, storage         own SW, storage
```

Middleware reads each request's `Host` header and rewrites internally to `/apps/<subdomain>`. From the browser's perspective, every subdomain is a fully isolated origin — its own service worker, storage, and install prompt. From your infrastructure, it's one repo and one deploy.

See [`docs/architecture.md`](docs/architecture.md) for the full picture.

---

## The AI Studio

The studio lives in `.claude/`: 12 specialized agents coordinated by 7 slash-command skills. Every spec, change plan, and deploy passes through a user-approval gate — agents do the work, you make the decisions.

<details>
<summary><b>Agents and skills (expand)</b></summary>

**Leads** — coordinate at the product/design level:

| Agent | Role |
|---|---|
| `product-lead` | Plain-language brief → concrete spec (schema, routes, integrations) |
| `tech-lead` | Plans modifications to existing apps with an approval gate |
| `design-lead` | Defines visual identity: palette, icon, typography |

**Specialists** — execute the work:

| Agent | Role |
|---|---|
| `app-architect` | Scaffolds the app folder from `_template` |
| `app-builder` | Writes pages, components, and server actions |
| `pwa-specialist` | Manifest, service worker, install prompt, icon set |
| `db-migrator` | Schema, migrations, table prefixes |
| `ui-designer` | Implements the design lead's identity |
| `mcp-integrator` | Connects MCP servers (Gmail, Calendar, Notion, Drive) |
| `deployer` | Vercel deploy + subdomain routing |
| `qa-auditor` | Lighthouse, PWA manifest, a11y |
| `architecture` | Read-only codebase Q&A |

**Skills** — the workflows that orchestrate agents:

| Skill | Use when you say… |
|---|---|
| `/create-app` | "I want an app that…" / "Build me a…" |
| `/modify-app` | "Change X" / "Add Y to my app" |
| `/theme-app` | "Make it feel more like…" / "Change the colors" |
| `/add-mcp` | "Connect it to my Gmail / Calendar / Notion" |
| `/deploy-app` | "Ship it" / "Push to production" |
| `/pwa-audit` | "Is it installable?" / "Check Lighthouse" |
| `/delete-app` | "Remove the X app" |

</details>

Read [`docs/ai-studio.md`](docs/ai-studio.md) for the full agent system.

---

## Deploy to production

```bash
vercel --prod
```

Then in your DNS provider, add **two records**:

- Apex `yourdomain.com` → A/ALIAS to Vercel
- Wildcard `*.yourdomain.com` → `cname.vercel-dns.com`

Add both as custom domains in the Vercel dashboard. The wildcard covers every app you'll ever create — no per-app projects, no per-app DNS.

> Using a Vercel-provided domain? Add `*.yourproject.vercel.app` as well.

After this, every `vercel --prod` makes new apps live at their subdomain automatically. See [`docs/deployment.md`](docs/deployment.md).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| UI | React 19, Tailwind CSS, shadcn/ui |
| Database | Drizzle ORM — SQLite (default), Turso, Postgres, MySQL, Cloudflare D1 |
| Auth | Better Auth — cross-subdomain SSO out of the box |
| PWA | Native Next.js manifest + Serwist service workers |
| AI | Claude Code agents + skills, Anthropic SDK, MCP servers |
| Deploy | Single Vercel project + wildcard DNS |

Switch backends with one env variable (`DB_ADAPTER=sqlite|turso|postgres|mysql|d1`). See [`docs/backend-options.md`](docs/backend-options.md).

---

## PWA details

- **Subdomain isolation** — each app has its own origin, service worker, and storage. Uninstalling Notes doesn't touch Fitness.
- **Native Next.js 15 manifest** + **Serwist** for service workers (the maintained successor to `next-pwa`).
- **Lighthouse-gated** — `qa-auditor` blocks deploy if any PWA score < 90.

Deeper dive: [`docs/pwa-deep-dive.md`](docs/pwa-deep-dive.md).

---

## Documentation

- [Getting Started](docs/getting-started.md) — setup and first run
- [Architecture](docs/architecture.md) — how the pieces fit
- [Creating Apps](docs/creating-apps.md) — manifest contract, schema, structure
- [AI Studio](docs/ai-studio.md) — agents, skills, workflows
- [PWA Deep Dive](docs/pwa-deep-dive.md) — manifests, service workers, install
- [Theming](docs/theming.md) — visual identity and personalization
- [Deployment](docs/deployment.md) — Vercel, wildcard DNS, self-hosted
- [Backend Options](docs/backend-options.md) — SQLite, Turso, Postgres, MySQL, D1
- [MCP Integrations](docs/mcp.md) — Gmail, Calendar, Notion, Drive

---

## What this is not

- ❌ Not a SaaS template — there's one user (you). For multi-tenant, use [Makerkit](https://makerkit.dev).
- ❌ Not a homelab dashboard — for link launchers, use [Dashy](https://dashy.to).
- ❌ Not a Notion replacement — for general-purpose knowledge tools, use Notion.
- ❌ Not a marketplace — your apps are yours, not distributed to others.

---

## Contributing

AppAtelier is **v1.0** and actively maintained. The most valuable contributions: example apps you've built for yourself, new agents/skills, non-Vercel deploy guides (Coolify, Fly.io, self-hosted), bug reports.

See [CONTRIBUTING.md](CONTRIBUTING.md) · [ROADMAP.md](ROADMAP.md) · [Issues](https://github.com/smariconde/app_atelier/issues) · [Discussions](https://github.com/smariconde/app_atelier/discussions).

---

## License

[MIT](LICENSE) — build whatever you want for yourself.

---

<div align="center">

*"The future isn't just big generic apps. It's ultra-niche, ultra-personalized apps that each individual can create for their exact needs."* — **Naval Ravikant**

Inspired by [Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) · [shadcn/ui](https://ui.shadcn.com) · [Anthropic Skills](https://code.claude.com/docs/en/skills) · [web.dev multi-PWA](https://web.dev/articles/building-multiple-pwas-on-the-same-domain)

**The App Store era gave everyone access to the same apps. The AI era gives everyone access to their own.**

</div>
