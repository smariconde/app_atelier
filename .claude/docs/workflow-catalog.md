# Studio Workflow Catalog

Single source of truth for which skill invokes which agents, in what order, with which gates.

---

## `/create-app` — Build a new app from scratch

**Agents** (in order): `product-lead` → `app-architect` → `mcp-integrator`* → `app-builder` → `pwa-specialist`

```
brief
  └─ product-lead ──────────── writes .claude/specs/<appId>.md
        ↓ GATE 1: user approves spec
  app-architect ──────────── scaffold + registry + db:setup
  mcp-integrator* ─────────── wire MCP servers (only if spec has mcpServers)
        ↓ GATE 2: user confirms app loads at <appId>.localhost:3000
  app-builder ─────────────── pages + server actions
  pwa-specialist ──────────── validate + auto-fix PWA config
        ↓ GATE 3: completion summary
```

**Irreversible steps**: scaffold (`pnpm new-app`), db:setup, registry writes  
**Rules referenced**: `manifest-contract.md`, `db-schema.md`, `pwa.md`, `server-actions.md`, `hub-constraint.md`

---

## `/modify-app` — Change an existing app

**Agents** (in order): `tech-lead` → `app-builder` → `db-migrator`* → `pwa-specialist`

```
change request (+ AskUserQuestion to classify type)
  └─ tech-lead ─────────────── reads app, writes change plan (read-only)
        ↓ GATE 1: user approves plan
  app-builder ─────────────── implements approved changes
  db-migrator* ────────────── schema migration (only if plan says schema changed)
  pwa-specialist ──────────── validate doctor + manifest still healthy
        ↓ GATE 2: completion summary with revert instructions
```

**Irreversible steps**: db migration (SQL applied)  
**Reversible steps**: all file changes (`git restore`)  
**Rules referenced**: `db-schema.md`, `server-actions.md`, `hub-constraint.md`

---

## `/theme-app` — Change visual identity

**Agents** (in order): `design-lead` → `ui-designer` → `pwa-specialist`

```
theme intent (color, mood, icon preference)
  └─ design-lead ───────────── produces theme brief (read-only: no code)
        ↓ GATE 1: user approves theme brief
  ui-designer ─────────────── updates layout.tsx (CSS vars) + manifest (icon, color)
  pwa-specialist ──────────── validate manifest themeColor + icons still valid
        ↓ GATE 2: completion summary with icon regen warning
```

**Rules referenced**: `manifest-contract.md`, `pwa.md`

---

## `/delete-app` — Remove an app

**Agents**: none (direct script execution)

```
typed confirmation ("type <appId> to confirm")
  └─ scripts/delete-app.ts ── removes apps/<appId>/, app/apps/<appId>/, public icons,
                              updates app/manifest.ts + hub/page.tsx,
                              runs pnpm doctor
```

**Irreversible steps**: filesystem deletion, registry edits (use git restore if needed)  
**Rules referenced**: `hub-constraint.md`

---

## `/deploy-app` — Deploy to Vercel

**Agents**: `deployer`

```
typed confirmation ("type 'deploy' to confirm")
  └─ deployer ──────────────── preflight checks → pnpm build → vercel deploy
                              prints production URL + DNS wildcard instructions
```

**Irreversible steps**: Vercel deployment (cannot un-deploy, but can redeploy)

---

## `/pwa-audit` — Audit PWA health

**Agents**: `qa-auditor`

```
(no gate — read-only report)
  └─ qa-auditor ────────────── static checks always
                              Lighthouse scores if --url provided
                              blocks deploy recommendation if any score < 90
```

**Rules referenced**: `pwa.md`

---

## `/add-mcp` — Connect an MCP server to an existing app

**Agents**: `mcp-integrator`

```
(no gate — manifest edit is reversible)
  └─ mcp-integrator ────────── validates inputs, updates apps/<appId>/manifest.ts,
                              runs pnpm doctor MCP section,
                              prints env var setup instructions
```

**Rules referenced**: `manifest-contract.md`

---

## `/architecture` — Read-only Q&A

**Agents**: `architecture`

```
(no gate — read-only)
  └─ architecture ──────────── reads codebase files, answers question, never writes
```

---

## Agent-only (invoked by skills, not user-facing)

| Agent | Invoked by | Purpose |
|---|---|---|
| `product-lead` | `/create-app` Phase 1 | Brief → spec |
| `tech-lead` | `/modify-app` Phase 2 | App reading → change plan |
| `design-lead` | `/theme-app` Phase 1 | Theme intent → brief |
| `app-architect` | `/create-app` Phase 2 | Scaffold + registry wiring |
| `app-builder` | `/create-app` Phase 3, `/modify-app` Phase 3 | Pages + actions |
| `mcp-integrator` | `/create-app` Phase 2b, `/add-mcp` | Manifest mcpServers wiring |
| `db-migrator` | `/modify-app` Phase 4 | Schema evolution + SQL migration |
| `ui-designer` | `/theme-app` Phase 2 | CSS vars + manifest icon/color |
| `pwa-specialist` | `/create-app` Phase 4, `/modify-app` Phase 5, `/theme-app` Phase 3 | PWA validation + auto-fix |
| `deployer` | `/deploy-app` | Vercel build + deploy |
| `qa-auditor` | `/pwa-audit` | Lighthouse + manifest validation |
| `architecture` | `/architecture` | Codebase Q&A |
