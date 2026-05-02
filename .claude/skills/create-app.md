# /create-app skill

**Trigger**: `/create-app [optional app idea]`

**Description**: Full lifecycle from a plain-language brief to a working, installable PWA. Orchestrates four specialized agents across four phases with explicit user approval gates between them.

---

## Overview

Four agents, four phases, three approval gates:

```
[brief] → product-lead → spec.md
                              ↓ GATE 1: user approves spec
         app-architect → scaffold + registry + db
                              ↓ GATE 2: user confirms app loads
           app-builder → pages + server actions
          pwa-specialist → validation report
                              ↓ GATE 3: user confirms done
```

---

## Phase 1 — Brief & Spec

**Agent**: `product-lead`

1. If the user provided an idea after `/create-app`, use that as the brief. Otherwise ask:
   > "What app do you want to build? Describe it in a sentence or two."

2. Invoke the `product-lead` agent with the brief. The agent will:
   - Ask 3–5 clarifying questions to resolve ambiguity
   - Write a spec to `.claude/specs/<appId>.md`
   - Print the approval gate message

3. After product-lead finishes, show its output to the user. Then stop — do not proceed to Phase 2 until the user explicitly approves.

---

## Gate 1: Spec Review

Wait for the user to say "approve spec", "looks good", "proceed", or similar confirmation.

If they request changes, run product-lead again with the revision notes: "User wants to change: [changes]. Please update `.claude/specs/<appId>.md` accordingly."

Do not proceed to scaffolding until spec is approved.

---

## Phase 2 — Scaffold

**Agent**: `app-architect`

1. Invoke the `app-architect` agent with the spec path. Provide the full path: `.claude/specs/<appId>.md`.

2. The agent will:
   - Run `pnpm new-app <appId>`
   - Wire `app/manifest.ts` (import + registry entry)
   - Wire `app/apps/hub/page.tsx` (import + apps array)
   - Update `apps/<appId>/manifest.ts` from spec
   - Update `apps/<appId>/db/schema.ts` from spec
   - Run `pnpm db:setup`

3. After app-architect finishes, show its output and prompt the user:

   > "Scaffold complete. If your dev server is running, refresh it (or restart `pnpm dev`) and open `http://<appId>.localhost:3000` — you should see the template page. Once it loads, say 'proceed' to implement the UI."

---

## Phase 2b — MCP wiring _(only if spec declares `mcpServers`)_

If the spec has an `## MCP Servers` section, invoke the `mcp-integrator` agent for each declared server:
- Pass the `appId` and each `serverId`
- The agent updates the manifest and prints env var setup instructions

Show the setup instructions to the user, then add:
> "You don't need to configure env vars before proceeding — the app will show a clear error message if they're missing. Configure them whenever you're ready."

Do not block Phase 3 on MCP env var setup.

---

## Gate 2: Scaffold Verification

Wait for the user to confirm the scaffolded page loads.

If it doesn't load, help troubleshoot:
- Check that `app/manifest.ts` has the import
- Check that `app/apps/hub/page.tsx` has the import and array entry
- Check that `pnpm db:setup` ran without errors

Do not proceed to Phase 3 until the user confirms the app loads.

---

## Phase 3 — Implementation

**Agent**: `app-builder`

1. Invoke the `app-builder` agent with the spec path: `.claude/specs/<appId>.md`.

2. The agent will:
   - Read the Notes app as reference implementation
   - Implement `app/apps/<appId>/layout.tsx`
   - Implement `app/apps/<appId>/page.tsx`
   - Implement `app/apps/<appId>/actions.ts`
   - Implement `app/apps/<appId>/[id]/page.tsx` if the spec requires a detail view

3. No approval gate — implementation is fully reversible. Show the agent's completion summary.

---

## Phase 4 — PWA Validation

**Agent**: `pwa-specialist`

1. Invoke the `pwa-specialist` agent with the appId.

2. The agent will:
   - Run `pnpm doctor`
   - Validate manifest fields
   - Check for icon files in `public/`
   - Verify `<InstallPrompt />` is in the layout
   - Auto-fix what it can, report what needs manual action

3. Show the agent's final report.

---

## Gate 3: Done

Print the completion summary:

```
✓ <AppName> is ready.

  App URL:  http://<appId>.localhost:3000
  Hub:      http://localhost:3000

Next steps:
  1. Test the full CRUD workflow in the browser
  2. Check that the app appears as an icon in the hub
  3. If you want a custom icon:
       pnpm generate-icons --input <your-1024px-image.png> --app <appId>

Agents available for fixes:
  product-lead    → revise the spec
  app-architect   → fix scaffolding or registry issues
  app-builder     → change the UI or add features
  pwa-specialist  → fix PWA config
```

---

## Constraints enforced throughout all phases

- **Never** create a Vercel project or run `vercel` commands
- **Never** use path-based routing — the app lives at `<appId>.localhost:3000`, not `/tasks`
- **Always** table prefix = `<appId>_` (e.g., `tasks_tasks`, not just `tasks`)
- **Hub is a launcher** — never add widgets or data summaries to the hub
- **Single user** — no authentication, no multi-tenancy in v0.2 apps
- **One dev server** — all apps run from the same `pnpm dev` process

---

## If something goes wrong

- **Spec needs revision**: Call product-lead again with the feedback
- **Registry not wired**: Call app-architect again, it will read the spec and fix the two registry files
- **UI looks wrong**: Call app-builder again with specific changes requested
- **Doctor fails**: Call pwa-specialist again — it will diagnose and auto-fix what it can
