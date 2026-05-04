---
name: modify-app
description: "TRIGGER when user wants to change, update, fix, or add features to an existing app. Safely modifies an existing AppAtelier app with a tech-lead change plan and user approval gate. SKIP for new apps — use /create-app instead. SKIP for theme/color changes — use /theme-app instead."
argument-hint: "<appId> [description of change]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent
agent: tech-lead
---

## Agents used

- `tech-lead` — reads the app and produces a change plan
- `app-builder` — implements the approved changes
- `db-migrator` — applies schema migration (only if schema changed)
- `pwa-specialist` — validates PWA health after changes

---

## Overview

Two approval gates protect existing apps:

```
[change request] → tech-lead → change plan
                                    ↓ GATE 1: user approves plan
                 app-builder → implements changes
                 db-migrator → applies migration (only if schema changed)
                pwa-specialist → validates PWA still healthy
                                    ↓ GATE 2: user confirms
```

---

## Phase 1 — Classify the change

Before invoking tech-lead, use AskUserQuestion to pre-classify the change type so tech-lead gets accurate context:

> "What kind of change is this?"
> - UI only (labels, layout, copy, color)
> - Adds or removes data fields (schema change likely)
> - Adds a new page or route
> - Mixed / unsure — let tech-lead decide

Include the user's answer in the context passed to tech-lead.

---

## Phase 2 — Change Planning

**Agent**: `tech-lead`

1. Extract the `appId` from the command. If no description was provided, ask:
   > "What would you like to change in `<appId>`?"

2. Invoke the `tech-lead` agent with:
   - The appId
   - The full change description
   - The change-type classification from Phase 1
   - This context: "Read the existing app at `apps/<appId>/` and `app/apps/<appId>/`, then produce a change plan."

3. Show the tech-lead's full output to the user.

---

## Gate 1: Plan Review

Wait for the user to say "approve plan", "looks good", "proceed", or similar explicit confirmation.

If they want adjustments, re-invoke tech-lead with the feedback:
> "User wants to adjust: [feedback]. Please revise the change plan for `<appId>`."

Do not proceed to implementation until the plan is explicitly approved.

---

## Phase 3 — Implementation

**Agent**: `app-builder`

Invoke the `app-builder` agent with:
- The appId
- The approved change plan (paste the full plan text)
- This instruction: "Implement exactly the changes described in this plan. Respect all constraints listed under 'Constraints for app-builder'. Do not modify files listed under 'Files to Protect'."

No gate — implementation is fully reversible with `git restore`.

If the agent fails, use AskUserQuestion:
- "Retry with the same plan"
- "Revise the plan and retry"
- "Abort — I'll fix manually"

---

## Phase 4 — Migration (conditional)

**Agent**: `db-migrator`

Run this phase **only** if the tech-lead plan's "Schema Changes" section said **YES**.

Invoke the `db-migrator` agent with:
- The appId
- The "Schema Changes" section from the approved plan (paste it verbatim)

Show the generated SQL and migration result before proceeding.

---

## Phase 5 — Validation

**Agent**: `pwa-specialist`

Invoke the `pwa-specialist` agent with the appId. It will:
- Run `pnpm doctor`
- Verify the app route still exists
- Confirm manifest and icons are intact

Show its report.

---

## Gate 2: Done

Print the completion summary:

```
✓ <AppName> updated.

  App URL:  http://<appId>.localhost:3000

What changed:
  [list files changed, from the tech-lead plan's "Files to Change" section]

Next steps:
  1. Refresh http://<appId>.localhost:3000 and test the change
  2. Check that the hub still shows the app icon

How to revert:
  Specific files: git restore <file>
  Everything:     git restore app/apps/<appId>/ apps/<appId>/
```

---

## Constraints enforced throughout

- **Only touch** files listed in the tech-lead plan's "Files to Change"
- **Never** modify hub page, middleware, or other apps
- **Never** use path-based routing — the app stays at `<appId>.localhost:3000`
- **Always** table prefix = `<appId>_`
- **Never** add auth or multi-tenancy

---

## If something goes wrong

| Problem | Action |
|---|---|
| Plan needs revision | Re-invoke tech-lead with specific feedback |
| Build errors after implementation | Re-invoke app-builder with the error message |
| Migration failed | Re-invoke db-migrator — it will diagnose and retry |
| Doctor fails post-change | Re-invoke pwa-specialist |
| Need complete rollback | `git restore app/apps/<appId>/ apps/<appId>/` |
