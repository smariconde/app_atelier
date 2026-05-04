# apps/daily-briefing/

Daily Briefing app workspace package. AI-powered morning summary of Gmail and Calendar — no local database, all data comes from MCP.

## Manifest

- **id / subdomain**: `daily-briefing` → `daily-briefing.localhost:3000` in dev
- **icon**: `sun` (Lucide)
- **color**: `#38BDF8` (sky)
- **status**: `experimental`
- **MCP servers**: `gmail`, `google-calendar`

## Architecture

This app has **no database** — it fetches all data live via MCP:
- `GOOGLE_MCP_URL` + `GOOGLE_MCP_TOKEN` — Google MCP server (covers both Gmail and Calendar)
- `ANTHROPIC_API_KEY` — Claude model for generating the briefing

The server action (`app/apps/daily-briefing/actions.ts`) creates an MCP client via `@modelcontextprotocol/sdk`, fetches tools (Gmail + Calendar), then streams a briefing through `ai/rsc` using Claude.

## UI routes

Pages live in `app/apps/daily-briefing/`:
- `/` (rewritten from `daily-briefing.localhost:3000`) → `page.tsx` — single-page with Generate button, streaming text output, and error display

A `'use client'` page calls the `generateBriefing` server action, reads the streamable value, and renders the markdown briefing in real time.
