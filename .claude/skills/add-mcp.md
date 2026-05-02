# /add-mcp skill

**Trigger**: `/add-mcp <appId> <serverId>`

**Description**: Connects an MCP server to an existing app. Updates the manifest `mcpServers` declaration and prints setup instructions. Does not write app code — if you want a server action that uses the MCP server, follow up with `/modify-app`.

---

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
