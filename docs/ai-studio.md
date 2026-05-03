# AI Studio

The `.claude/` directory is a team of specialized AI agents orchestrated by skills (slash commands in Claude Code). Agents never take irreversible actions without your approval.

---

## The model: leads vs specialists

**Lead agents** (run on Opus) plan and decide. They ask clarifying questions, produce an artifact (spec, change plan, theme brief), and stop at an approval gate. No code is written until you say "proceed".

**Specialist agents** (run on Sonnet) execute. They implement what the lead planned, constrained to the files listed in the plan. Specialists can be re-invoked if something goes wrong.

---

## Agents

| Agent | Model | Role |
|---|---|---|
| `architecture` | Sonnet | Knowledge-only Q&A — reads files, never writes |
| `product-lead` | Opus | Converts a brief into a structured `spec.md` |
| `tech-lead` | Opus | Plans changes to an existing app — produces a change plan |
| `design-lead` | Opus | Decides brand color, HSL palette, icon, typography weight |
| `app-architect` | Sonnet | Runs `pnpm new-app`, wires manifest registry, sets up DB schema |
| `app-builder` | Sonnet | Implements pages + server actions from a spec or change plan |
| `mcp-integrator` | Sonnet | Adds MCP server declarations to manifest, prints env var setup |
| `db-migrator` | Sonnet | Schema changes, generates migration SQL, shows it before applying |
| `ui-designer` | Sonnet | Applies design-lead's theme brief — CSS variable overrides in layout.tsx |
| `pwa-specialist` | Sonnet | Validates manifest, icons, InstallPrompt, runs `pnpm doctor` |
| `deployer` | Sonnet | Runs `vercel --prod` for the single project only, never per-app |
| `qa-auditor` | Sonnet | Lighthouse + manifest validation, blocks deploy if any score < 90 |

---

## Skills

Skills are slash commands in Claude Code. Type them in the chat prompt.

| Skill | Trigger | What it does |
|---|---|---|
| `/architecture` | `/architecture [question]` | Knowledge Q&A — architecture, package roles, constraints |
| `/create-app` | `/create-app [optional brief]` | Full lifecycle: brief → spec → scaffold → UI → PWA validation |
| `/modify-app` | `/modify-app <appId> [change]` | Safe edits with tech-lead change plan and approval gate |
| `/theme-app` | `/theme-app <appId> [brief]` | Palette + icon + typography via design-lead + ui-designer |
| `/deploy-app` | `/deploy-app` | Vercel production deploy with preflight gate |
| `/pwa-audit` | `/pwa-audit` | Lighthouse + manifest validation for all apps |
| `/add-mcp` | `/add-mcp <appId> <serverId>` | Connect a MCP server (gmail, notion, etc.) to an existing app |
| `/delete-app` | `/delete-app <appId>` | Permanently remove an app — shows deletion summary + confirmation gate |

---

## Hooks

Hooks run automatically based on tool usage. Defined in `.claude/settings.json`.

| Hook | Trigger | Action |
|---|---|---|
| PreToolUse | `Bash` tool running `git commit` | Runs `pnpm doctor` — blocks the commit if doctor fails |
| PostToolUse | `Write` or `Edit` on any `manifest.ts` | Reminds you to regenerate icons if `pwa.icons` changed |
| SessionStart | Every new Claude Code session | Runs `pnpm studio-status` to show the current app inventory |

---

## End-to-end `/create-app` walkthrough

`/create-app` has four phases and three approval gates:

```
[brief] → product-lead → spec.md
                              ↓ GATE 1: you approve the spec
         app-architect → scaffold + registry wiring + DB setup
                              ↓ GATE 2: you confirm the app loads at localhost
           app-builder → pages + server actions implemented
          pwa-specialist → manifest validation + icon checks
                              ↓ GATE 3: completion summary, you're done
```

**Phase 1 — Brief & Spec**

`product-lead` (Opus) takes your brief, asks 3–5 clarifying questions to resolve ambiguity, then writes a structured spec to `.claude/specs/<appId>.md`. It covers: data model, pages, server actions, optional MCP servers, and done criteria.

Gate 1: Reply "approve spec" (or describe changes first).

**Phase 2 — Scaffold**

`app-architect` runs `pnpm new-app <appId>`, wires `app/manifest.ts` and `app/apps/hub/page.tsx`, fills in the manifest from the spec, writes the DB schema, and runs `pnpm db:setup`.

If the spec declared `mcpServers`, `mcp-integrator` runs here and prints env var setup instructions. You don't need to configure them before proceeding.

Gate 2: Open `http://<appId>.localhost:3000` and confirm the template page loads.

**Phase 3 — Implementation**

`app-builder` reads the spec and the Notes app as a reference, then implements `layout.tsx`, `page.tsx`, `actions.ts`, and optionally `[id]/page.tsx`. No gate — this is fully reversible with `git restore`.

**Phase 4 — PWA Validation**

`pwa-specialist` runs `pnpm doctor`, checks for icon files in `public/`, verifies `<InstallPrompt />` is in the layout, and auto-fixes what it can.

Gate 3: Completion summary printed. Test, install, ship.

---

## When to use `/modify-app` vs manual edits

Use `/modify-app` when:
- The change touches multiple files (page + actions + schema)
- You want a tech-lead change plan before any code is written
- The change involves a DB schema migration

Edit manually when:
- The change is small and contained (fix a label, tweak a color)
- You know exactly which file to touch
- You want immediate changes without a planning phase

`/modify-app` enforces that the implementation only touches files listed in the approved plan. Manual edits have no such constraint — use `pnpm doctor` and `pnpm typecheck` to verify you haven't broken anything.

---

## Approval gates summary

Three gates in `/create-app`, two in `/modify-app`, one each in `/deploy-app` and `/delete-app`:

| Gate | Skill | What you're approving |
|---|---|---|
| Spec review | `/create-app` | The product-lead's spec before any files are created |
| Scaffold verification | `/create-app` | That the scaffolded app loads in the browser |
| Completion | `/create-app` | Final sign-off after PWA validation |
| Change plan review | `/modify-app` | The tech-lead's plan before any files are modified |
| Completion | `/modify-app` | Final sign-off after implementation + validation |
| Pre-deploy preflight | `/deploy-app` | QA audit results before `vercel --prod` runs |
| Deletion confirmation | `/delete-app` | Full summary of what will be removed before `pnpm delete-app --yes` runs |
