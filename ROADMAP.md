# 🛣️ AppAtelier — Roadmap

This is a living document. Last updated: 2026-04-30.

The goal of this project is to make the paradigm Naval describes real and accessible: **anyone should be able to describe what they want in plain language and end up with a real, installable app built exactly for them**. The roadmap prioritizes the things that close the gap between "I have an idea" and "the app is on my phone".

Milestones have concrete "done" criteria. Anything not on this list is not on the roadmap — scope creep is the enemy of a focused tool.

---

## ✅ v0.1 — Foundation _(shipped 2026-04-30)_

**Goal**: The repo runs locally, the launcher renders, the manifest + PWA contract works end-to-end with one example app.

- [x] Monorepo scaffold (pnpm + Turborepo) as a **single Next.js project** — one codebase, one deploy
- [x] Next.js middleware routing by hostname: `notes.yourdomain.com` → `/apps/notes` internally, `yourdomain.com` (apex) → launcher
- [x] Local dev: all apps accessible via `[name].localhost:3000` from the same dev server
- [x] `@hub/core` exports `defineManifest` with strict types (incl. PWA fields and `subdomain`)
- [x] `@hub/db` with SQLite adapter (local-first default)
- [x] `@hub/auth` with Better Auth, cross-subdomain cookies (`Domain=.yourdomain.com`) for SSO across all apps
- [x] `@hub/ui` with shadcn/ui base components and dark mode default
- [x] `@hub/pwa` with `buildPWAManifest`, base service worker (Serwist), install prompt component (with iOS Safari fallback)
- [x] `apps/hub/` renders a desktop-style icon grid (no widgets, no clutter)
- [x] `apps/_template/` PWA-ready: `manifest.ts` (registry), `app/manifest.ts` (PWA), service worker, install prompt, icon set
- [x] One example app: Notes, accessible at `notes.localhost:3000`, fully installable as PWA
- [x] `pnpm new-app <name>` CLI scaffolds a new app — automatically available at its subdomain after next deploy, no Vercel config needed
- [x] Icon generator script: 1024×1024 input → full PWA icon set output
- [x] CLAUDE.md base + `/architecture` skill (knowledge-only)
- [ ] CI: typecheck + lint + Lighthouse PWA audit on example app _(typecheck + lint done; Lighthouse needs a running server in CI)_

**Definition of done**: clone the repo, run `pnpm install && pnpm dev`, see the hub at `localhost:3000` with one icon. Click it, get redirected to `notes.localhost:3000`, the app loads, the browser offers to install it as a PWA — all from the same server process.

---

## ✅ v0.2 — Studio v0 _(shipped 2026-04-30)_

**Goal**: Close the most important gap — from "I described what I want" to "there's a working app". Four core studio agents working in coordination via the `/create-app` skill. Claude takes a plain-language brief and produces a working, installable PWA autonomously.

- [x] Agent definitions in `.claude/agents/`:
  - [x] `product-lead.md` — brief → `.claude/specs/<appId>.md` with approval gate (Opus)
  - [x] `app-architect.md` — scaffold via `pnpm new-app`, wires manifest registry in both registry files
  - [x] `app-builder.md` — implement pages and server actions from spec
  - [x] `pwa-specialist.md` — PWA manifest validation, auto-fix, icons, install prompt
- [x] Skill `/create-app` orchestrating the 4 agents with explicit phases and 3 approval gates
- [x] Skill `/architecture` for knowledge-only Q&A _(shipped in v0.1)_
- [x] Two more example apps: Tasks, Habits (run `/create-app` to build these — validates the workflow)
- [x] `pnpm doctor` validates manifests, schemas, PWA configs — now dynamic per-app
- [ ] Smoke test: feed the studio a brief, get a working installable app on first try

**Definition of done**: someone with no technical background describes what they want in a sentence or two. 9 out of 10 times, what they described is running as an installable PWA at its subdomain, with no manual intervention beyond the approval gates.

---

## ✅ v0.3 — Studio v1 Complete _(shipped 2026-05-01)_

**Goal**: Full 7-agent studio with all skills and hooks. Production-ready AI workflow.

- [x] All 9 agent definitions:
  - [x] `product-lead`, `tech-lead`, `design-lead` (the leads)
  - [x] `app-architect`, `app-builder`, `pwa-specialist`, `db-migrator`, `ui-designer` (the specialists)
  - [ ] `deployer`, `qa-auditor` _(v0.4)_
- [x] Core skills:
  - [x] `/create-app` — full lifecycle
  - [x] `/modify-app` — safely edits existing apps (tech-lead gate)
  - [x] `/theme-app` — palette, icon, typography via design-lead + ui-designer
  - [x] `/architecture` — knowledge-only
  - [ ] `/deploy-app`, `/pwa-audit` _(v0.4)_
  - [ ] `/add-mcp` _(v0.6)_
- [x] Claude Code hooks (`.claude/settings.json`):
  - [x] PreCommit: `pnpm doctor` — blocks git commit on failures
  - [x] PostEdit on manifest.ts: icon regeneration reminder
  - [x] SessionStart: `pnpm studio-status`
- [x] `pnpm doctor --fix` auto-repairs missing manifest registry + hub wiring
- [x] `pnpm studio-status` shows apps, agents, skills, hook status

**Definition of done**: a developer with no prior context to the repo can do the entire lifecycle (create, modify, theme) of an app via the studio, only using natural language with Claude.

---

## 📋 v0.4 — Production Deploy Automation

**Goal**: From local dev to `*.yourdomain.com` should be a single command + one-time DNS setup. No Vercel dashboard clicking.

The deployment model is: **one Vercel project, wildcard DNS, middleware routing**. The `deployer` agent and `pnpm ship` script automate the initial setup; after that, every new app is live at its subdomain on the next `vercel --prod` with zero extra configuration.

- [ ] `pnpm ship` script for first-time deploy:
  - [ ] Creates the Vercel project (via Vercel CLI) if it doesn't exist
  - [ ] Sets all env vars from `.env.production`
  - [ ] Triggers deploy
  - [ ] Prints the wildcard DNS instructions for the user's domain
  - [ ] Validates SSL and subdomain routing after deploy
- [ ] DNS guide in docs covering Cloudflare, Namecheap, Route 53 (just one wildcard record — `*.yourdomain.com → cname.vercel-dns.com`)
- [ ] Vercel dashboard guide: how to add `*.yourdomain.com` as a custom domain (one step, covers all current and future apps)
- [ ] Self-hosted alternative: Docker Compose + Caddy config for wildcard subdomain routing (for people who want zero Vercel dependency)
- [ ] `deployer` agent knows this model and never tries to create per-app Vercel projects

**Definition of done**: from a fresh clone to a live `hub.yourdomain.com` with all example apps available at their subdomains and installable on mobile, following only the documented steps, in under 15 minutes.

---

## 📋 v0.5 — Backend Adapters

**Goal**: Backend-agnostic for real. Same code runs on any supported backend with one env variable.

- [ ] Postgres adapter (Supabase, Neon, Vercel Postgres) — stable
- [ ] Turso adapter — stable
- [ ] Cloudflare D1 adapter — stable
- [ ] MySQL adapter (PlanetScale) — stable
- [ ] `pnpm db:migrate` runs migrations across all apps in dependency order
- [ ] `pnpm db:reset` for local dev
- [ ] Docs page per adapter with end-to-end setup guide
- [ ] Cross-subdomain SSO works on all adapters

**Definition of done**: switch from SQLite to Supabase to Turso by changing only `.env`, no code edits, all apps work identically including auth.

---

## 📋 v0.6 — MCP Integrations

**Goal**: Apps can consume external services via MCP servers cleanly.

- [ ] `@hub/ai` exports a typed MCP client wrapper
- [ ] Manifests can declare `mcpServers: ['gmail', 'notion', ...]`
- [ ] Skill `/add-mcp` connects an MCP server to an existing app
- [ ] Hub shows "MCP not connected" state when missing
- [ ] Example app: "Daily Briefing" using Gmail + Calendar MCP
- [ ] Vercel AI SDK helpers for streaming, tool use
- [ ] Docs: how to add a new MCP integration

**Definition of done**: an app can declare an MCP dependency in its manifest and consume it without boilerplate. The studio understands and respects MCP dependencies during creation.

---

## 🎯 v1.0 — Public Release

**Goal**: Stable enough for community adoption. Docs polished. APIs frozen.

- [ ] Manifest contract API frozen (semver promise from here)
- [ ] Migration guide: v0.x → v1.0
- [ ] Full docs site (Nextra or Fumadocs)
- [ ] Video walkthrough: "From clone to phone in 10 min"
- [ ] At least 5 community-contributed example apps
- [ ] At least 3 community-contributed agents/skills
- [ ] Issue templates, PR templates, CONTRIBUTING guide
- [ ] Test coverage > 70% on `@hub/core`, `@hub/pwa`
- [ ] Lighthouse score > 95 on hub and all example apps
- [ ] HN launch + Twitter announcement

---

## 🔮 Post-1.0 (Ideas, not committed)

These aren't promised, but represent interesting directions if the core is solid:

- **App templates gallery** — community-contributed starting points. "I want something like this person's fitness tracker, but for X" → clone the template, describe your customizations
- **Sync layer** — optional CRDT-based sync (Yjs/Automerge) for multi-device use of the same app
- **Mobile shell** — wrap the hub in Capacitor for a truly native installable container on iOS/Android
- **Self-hosted Docker image** — one-command deploy on Coolify, Dokploy, Fly.io for people who want zero cloud vendor dependency
- **Studio observability** — token usage, agent runtimes, success rates per skill, so the studio improves over time
- **App backup/restore** — export an app's data + config as a portable bundle

---

## ❌ Explicitly out of scope

These keep getting suggested. The answer is no:

- **One Vercel project per app** — unnecessary, adds friction. Middleware routing gives subdomain isolation with a single project
- **Multi-tenancy** — this is personal software, audience of one. For SaaS use [Makerkit](https://makerkit.dev) or [T3](https://create.t3.gg)
- **Payments / billing** — not a SaaS, not needed
- **An admin panel for managing users** — there's one user (you)
- **Realtime / pub-sub baked in** — apps that need it can add it themselves
- **Built-in i18n** — apps decide if they need it
- **Visual no-code app builder** — the studio *is* the builder; that's the whole point
- **Public app marketplace** — security and trust at that scale is a separate product
- **Hub widgets / dashboards** — the hub is a launcher, not a dashboard. Intentional.

---

## How to influence the roadmap

1. Open an issue with the `roadmap-suggestion` label
2. Explain the use case (not just the feature)
3. Bonus: link to a PR with a prototype

The bar for adding things to v1.0 is high. The bar for post-1.0 ideas is much lower — we want to see what the community actually builds.
