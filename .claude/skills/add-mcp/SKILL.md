---
name: add-mcp
description: "TRIGGER when user wants to connect Gmail, Google Calendar, Notion, or Google Drive to an existing app, OR when a /create-app spec declares mcpServers. SKIP when user wants to write the server action that calls the MCP — use /modify-app after this skill runs. Updates manifest only. Never writes UI or server actions."
argument-hint: "<appId> <serverId>"
user-invocable: true
allowed-tools: Read, Bash, Agent
agent: mcp-integrator
---

## Agents used

- `mcp-integrator` — validates inputs, updates manifest, checks env vars, prints setup instructions

---

## Overview

```
[appId + serverId] → validate → update manifest → env var check → instructions
```

No approval gate — the manifest change is small and reversible with `git restore`.

---

## Phase 1 — Parse inputs

If `serverId` is missing, use AskUserQuestion to pick it:

> "Which MCP server would you like to connect to `<appId>`?"
> - `gmail` — Gmail read/send access
> - `google-calendar` — Calendar read/write
> - `drive` — Google Drive file access
> - `notion` — Notion pages and databases

If `appId` is also missing, ask for it as free text first.

Known server IDs: `gmail`, `google-calendar`, `drive`, `notion`.

---

## Phase 2 — Invoke `mcp-integrator`

Invoke the `mcp-integrator` agent with the appId and serverId.

The agent will:
- Validate inputs
- Edit `apps/<appId>/manifest.ts`
- Run `pnpm doctor` to check env var status
- Print server-specific setup instructions
- Print completion summary

If the agent fails, use AskUserQuestion:
- "Retry"
- "Abort — I'll configure manually"

---

## Phase 3 — Next steps hint

After the agent completes, add:

```
To add a server action that uses this MCP server, run:
  /modify-app <appId> [describe what you want the action to do]

The Daily Briefing app (app/apps/daily-briefing/actions.ts) shows the full
implementation pattern using experimental_createMCPClient + streamText from 'ai'.
```

---

## Constraints

- Only `/add-mcp` updates the manifest — it does NOT write server actions or UI
- The hub will show an orange badge on `<appId>` until the env vars are configured
- See `docs/mcp.md` for the full integration guide

## Reference

- Full integration guide: `docs/mcp.md`
- Canonical server action implementation: `app/apps/daily-briefing/actions.ts`
