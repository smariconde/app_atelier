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
| `db-migrator` | Schema changes, drizzle-kit generate + migrate, shows SQL before applying |
| `ui-designer` | Implements design-lead theme brief — CSS variables + manifest update |
| `pwa-specialist` | Manifest validation, icons, install prompt, `pnpm doctor` |
| `deployer` _(v0.4)_ | Vercel deploy — single project only, never per-app |
| `qa-auditor` _(v0.4)_ | Lighthouse + PWA manifest validation, blocks deploy if score < 90 |

## Skills (`.claude/skills/`)

Skills are invoked with `/skill-name` in the Claude Code UI.

| Skill | Purpose |
|---|---|
| `/architecture` | Knowledge-only Q&A |
| `/create-app` | Full lifecycle: brief → spec → scaffold → implement → PWA |
| `/modify-app` | Safely edit an existing app with tech-lead change plan |
| `/theme-app` | Change palette, icon, typography via design-lead + ui-designer |
| `/deploy-app` _(v0.4)_ | Vercel deploy + DNS instructions + audit gate |
| `/pwa-audit` _(v0.4)_ | Lighthouse + manifest validation |
| `/add-mcp` _(v0.6)_ | Connect an MCP server to an app |

## Hooks (`.claude/settings.json`)

| Hook | Trigger | Action |
|---|---|---|
| PreToolUse | `Bash` with `git commit` | Runs `pnpm doctor` — blocks commit on failure |
| PostToolUse | `Write` or `Edit` on `manifest.ts` | Reminds to regenerate icons if `pwa.icons` changed |
| SessionStart | Session open | Runs `pnpm studio-status` to show app inventory |

## Key principle

Every spec or change plan requires user approval before code is written. Every deploy requires user sign-off. Agents never take irreversible actions autonomously.
