# /modify-app skill

**Trigger**: `/modify-app <appId> [description of change]`

**Description**: Safely modifies an existing AppAtelier app. A tech-lead plans the change before any code is written, with a user approval gate. Supports UI changes, new features, and schema evolution.

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

## Phase 1 — Change Planning

**Agent**: `tech-lead`

1. Extract the `appId` from the command. If no description was provided, ask:
   > "What would you like to change in `<appId>`?"

2. Invoke the `tech-lead` agent with:
   - The appId
   - The full change description
   - This context: "Read the existing app at `apps/<appId>/` and `app/apps/<appId>/`, then produce a change plan."

3. Show the tech-lead's full output to the user.

---

## Gate 1: Plan Review

Wait for the user to say "approve plan", "looks good", "proceed", or similar explicit confirmation.

If they want adjustments, re-invoke tech-lead with the feedback:
> "User wants to adjust: [feedback]. Please revise the change plan for `<appId>`."

Do not proceed to implementation until the plan is explicitly approved.

---

## Phase 2 — Implementation

**Agent**: `app-builder`

Invoke the `app-builder` agent with:
- The appId
- The approved change plan (paste the full plan text)
- This instruction: "Implement exactly the changes described in this plan. Respect all constraints listed under 'Constraints for app-builder'. Do not modify files listed under 'Files to Protect'."

No gate — implementation is fully reversible with `git restore`.

---

## Phase 3 — Migration (conditional)

**Agent**: `db-migrator`

Run this phase **only** if the tech-lead plan's "Schema Changes" section said **YES**.

Invoke the `db-migrator` agent with:
- The appId
- The "Schema Changes" section from the approved plan (paste it verbatim)

Show the generated SQL and migration result before proceeding.

---

## Phase 4 — Validation

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

Changes made:
  [list files changed, from the tech-lead plan's "Files to Change" section]

Next steps:
  1. Refresh http://<appId>.localhost:3000 and test the change
  2. Check that the hub still shows the app icon

To revert specific files: git restore <file>
To revert everything: git restore app/apps/<appId>/ apps/<appId>/
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
