# .claude/ — AI Studio

The studio is a team of specialized agents orchestrated by skills (slash commands).

## Agents (`.claude/agents/`)

Agents are sub-agents invoked by skills or directly. Each has a markdown definition scoped to its role.

| Agent | Role |
|---|---|
| `architecture` | Knowledge-only Q&A about the codebase — reads, never writes |
| `product-lead` | Brief → `spec.md` with approval gate (Opus) |
| `tech-lead` | Plans modifications to existing apps — change plan with approval gate (Opus) |
| `design-lead` | Palette, icon, typography decisions — theme brief with approval gate (Opus) |
| `app-architect` | Runs `pnpm new-app`, wires manifest registry |
| `app-builder` | Implements pages + server actions from spec or change plan |
| `mcp-integrator` | Connects MCP servers to apps — updates manifest + prints setup instructions |
| `db-migrator` | Schema changes, drizzle-kit generate + migrate, shows SQL before applying |
| `ui-designer` | Implements design-lead theme brief — CSS variables + manifest update |
| `pwa-specialist` | Manifest validation, icons, install prompt, `pnpm doctor` |
| `deployer` | Vercel deploy — single project only, never per-app |
| `qa-auditor` | Lighthouse + PWA manifest validation, blocks deploy if score < 90 |

Invoke the `architecture` agent directly via `@architecture` for codebase Q&A.

## Skills (`.claude/skills/`)

Skills are invoked with `/skill-name` in the Claude Code UI.

| Skill | Purpose |
|---|---|
| `/create-app` | Full lifecycle: brief → spec → scaffold → implement → PWA |
| `/modify-app` | Safely edit an existing app with tech-lead change plan |
| `/theme-app` | Change palette, icon, typography via design-lead + ui-designer |
| `/deploy-app` | Vercel deploy + DNS instructions + preflight gate |
| `/pwa-audit` | Lighthouse + manifest validation |
| `/add-mcp` | Connect an MCP server to an existing app |
| `/delete-app` | Remove an app and all its files with a confirmation gate |

See `.claude/docs/workflow-catalog.md` for the full skill → agent → gate flow.

## Rules (`.claude/rules/`)

Per-domain coding constraints referenced by agents. Editing a rule propagates to all agents that reference it.

| Rule | Covers |
|---|---|
| `manifest-contract.md` | App manifest required fields and edit rules |
| `db-schema.md` | Table prefix rule, column types, migration safety |
| `server-actions.md` | `'use server'`, revalidatePath, schema import path |
| `pwa.md` | Icon files, InstallPrompt, service worker notes |
| `hub-constraint.md` | Single Vercel project, subdomains, registry sync, protected dirs |

## Docs (`.claude/docs/`)

| Doc | Purpose |
|---|---|
| `workflow-catalog.md` | Skill → agent → gate map (single source of truth) |

## Hooks (`.claude/settings.json`)

| Hook | Trigger | Action |
|---|---|---|
| PreToolUse | `Bash` with `git commit` | Runs `pnpm doctor` — blocks commit on failure |
| PostToolUse | `Write` or `Edit` on `manifest.ts` | Reminds to regenerate icons if `pwa.icons` changed |
| SessionStart | Session open | Runs `pnpm studio-status` to show app inventory |

`pnpm doctor` also validates skill structure: every `skills/*/SKILL.md` must have `name:` + `description:` frontmatter, and any `agent:` reference must point to a real agent file.

## Key principle

Every spec or change plan requires user approval before code is written. Every deploy requires user sign-off. Agents never take irreversible actions autonomously.
