---
name: delete-app
description: "Permanently removes an AppAtelier app — workspace package, Next.js routes, PWA icons, and all registry entries. One confirmation gate before any files are touched. NEVER use on hub or _template."
argument-hint: "<appId>"
user-invocable: true
allowed-tools: Read, Bash
agent: none
---

## Overview

One confirmation gate protects against accidental deletion:

```
[/delete-app <appId>] → show deletion summary
                              ↓ GATE: user types appId to confirm
                        pnpm delete-app <appId> --yes
                        pnpm doctor (automatic)
```

---

## Phase 1 — Show Deletion Summary

1. Extract `<appId>` from the command. If missing, ask:
   > "Which app would you like to delete?"

2. Read `apps/<appId>/manifest.ts` to show the user what they're about to remove:
   - App name, description, subdomain
   - Whether a DB schema exists at `apps/<appId>/db/schema.ts`

3. Print a summary like:

```
About to permanently delete: <appId>

  Name:        <App Name>
  Subdomain:   <appId>.yourdomain.com
  Description: <description>
  DB schema:   yes / no

Files that will be removed:
  apps/<appId>/              (workspace package + manifest)
  app/apps/<appId>/          (Next.js routes)
  public/<appId>-icon-*.png  (PWA icons, if present)

Registry entries that will be removed:
  app/manifest.ts            (import + registry entry)
  app/apps/hub/page.tsx      (import + apps array entry)

⚠  Database tables will NOT be dropped automatically.
   If you want to clean up DB tables, run: pnpm db:reset
   (this recreates all tables for remaining apps from scratch)
```

---

## Gate: Confirmation

Ask explicitly — do NOT use AskUserQuestion here (destructive actions require typed confirmation):

> "Type **`<appId>`** to permanently delete this app, or anything else to cancel."

Wait for the user's reply. Only proceed if they type exactly `<appId>`. Otherwise print "Aborted." and stop.

---

## Phase 2 — Execute Deletion

Run the script with `--yes` to skip the interactive prompt (the gate above already obtained confirmation):

```bash
pnpm delete-app <appId> --yes
```

The script handles everything:
- Deletes `apps/<appId>/` and `app/apps/<appId>/`
- Deletes `public/<appId>-icon-*.png` (if present)
- Removes import and entry from `app/manifest.ts`
- Removes import and entry from `app/apps/hub/page.tsx`
- Runs `pnpm doctor` to verify the result

If the script exits with a non-zero code, show the output and stop — do not attempt manual fixes unless the user asks.

---

## Phase 3 — Completion

Print the completion summary:

```
✓ <appId> deleted.

  The app has been fully removed from the codebase.
  The hub will no longer show its icon.

Database note:
  Tables prefixed with "<appId>_" still exist in the database.
  Run pnpm db:reset if you want to drop and recreate all tables.

To commit:
  git add -A
  git commit -m "chore: remove <appId> app"
```

---

## Constraints

- **Never** delete `apps/hub/` or `app/apps/hub/`
- **Never** delete `apps/_template/`
- **Never** run `pnpm db:reset` without explicit user instruction — it drops data for all apps
- If `pnpm doctor` fails after deletion, report the output and let the user decide next steps

---

## If something goes wrong

| Problem | Action |
|---|---|
| App not found | Confirm appId with `pnpm studio-status` |
| Doctor fails after deletion | Show doctor output; likely a stale import — ask user if they want to fix manually |
| User wants to undo | `git restore apps/<appId>/ app/apps/<appId>/` — icons are gone; they'd need `pnpm generate-icons` again |
