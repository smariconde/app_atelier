# /add-mcp skill

**Trigger**: `/add-mcp <appId> <serverId>`

**Description**: TRIGGER when user wants to connect Gmail, Google Calendar, Notion, or Drive to an existing app, OR when a `/create-app` spec declares `mcpServers`. SKIP when user wants to write the server action that calls the MCP — use `/modify-app` after this skill runs. Updates manifest only. Never writes UI or server actions.

---

## Before You Start

- App exists: `ls apps/<appId>/manifest.ts`
- `serverId` is one of: `gmail`, `google-calendar`, `drive`, `notion`
- App does NOT already declare this server (check `mcpServers` in its manifest)

If the app doesn't exist, run `/create-app` first.

## Overview

```
[appId + serverId] → validate → update manifest → env var check → instructions
```

No approval gate — the manifest change is small and reversible with `git restore`.

---

## Phase 1 — Parse inputs

If `/add-mcp` was invoked without arguments, ask:
> "Which app and MCP server would you like to connect?
> 
> Usage: `/add-mcp <appId> <serverId>`
> 
> Known server IDs: `gmail`, `google-calendar`, `drive`, `notion`"

Known app IDs are any directory under `apps/` that is not `hub` or `_template`.

---

## Phase 2 — Invoke `mcp-integrator`

Invoke the `mcp-integrator` agent with the appId and serverId.

The agent will:
- Validate inputs
- Edit `apps/<appId>/manifest.ts`
- Run `pnpm doctor` to check env var status
- Print server-specific setup instructions
- Print completion summary

---

## Phase 3 — Next steps hint

After the agent completes, add:

```
To add a server action that uses this MCP server, run:
  /modify-app

The Daily Briefing app (app/apps/daily-briefing/actions.ts) shows the full
implementation pattern using experimental_createMCPClient + streamText from 'ai'.
```

---

## Constraints

- Only `/add-mcp` updates the manifest — it does NOT write server actions or UI
- The hub will show an orange badge on `<appId>` until the env vars are configured
- See docs/mcp.md for the full integration guide

## Reference

- Full integration guide: `docs/mcp.md`
- Canonical server action implementation: `app/apps/daily-briefing/actions.ts`
