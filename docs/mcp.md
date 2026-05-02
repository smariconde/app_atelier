# MCP Integrations

Apps in AppAtelier can read and write external services — Gmail, Google Calendar, Notion, Google Drive — via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). The app declares which services it needs in its manifest; Claude uses those services as tools when generating AI responses.

---

## How it works

```
manifest.ts          apps/<id>/manifest.ts declares mcpServers: ['gmail', ...]
    ↓
.env                 GOOGLE_MCP_URL + GOOGLE_MCP_TOKEN set for the server
    ↓
server action        experimental_createMCPClient connects at request time
    ↓
streamText()         Claude calls MCP tools (fetch emails, get events, ...)
    ↓
page.tsx             client component streams the response to the user
```

The hub shows an orange `!` badge on any app whose declared MCP servers aren't configured. `pnpm doctor` also warns about missing env vars.

---

## Quick start

### Connect an MCP server to an existing app

```
/add-mcp notes notion
```

This updates `apps/notes/manifest.ts` to add `mcpServers: ['notion']` and prints the OAuth setup steps.

Then use `/modify-app` to add a server action that calls the Notion MCP.

### Connect during app creation

Tell the product-lead what external services the app needs:
> "I want an app that summarizes my unread Gmail and shows today's calendar"

The `/create-app` skill will automatically invoke the `mcp-integrator` agent after scaffolding.

---

## Available MCP servers

| ID | Service | Required env vars | Official docs |
|---|---|---|---|
| `gmail` | Gmail | `GOOGLE_MCP_URL`, `GOOGLE_MCP_TOKEN` | [Google Workspace MCP](https://workspace.google.com/products/mcp/) |
| `google-calendar` | Google Calendar | `GOOGLE_MCP_URL`, `GOOGLE_MCP_TOKEN` | [Google Workspace MCP](https://workspace.google.com/products/mcp/) |
| `drive` | Google Drive | `GOOGLE_MCP_URL`, `GOOGLE_MCP_TOKEN` | [Google Workspace MCP](https://workspace.google.com/products/mcp/) |
| `notion` | Notion | `NOTION_MCP_TOKEN` | [Notion Integrations](https://www.notion.so/profile/integrations) |

Gmail, Google Calendar, and Drive all use the same Google Workspace MCP endpoint — one set of env vars covers all three.

---

## Env var setup

Add to your `.env`:

```env
# Required for all AI features
ANTHROPIC_API_KEY=sk-ant-...

# Google Workspace MCP (gmail, google-calendar, drive)
GOOGLE_MCP_URL=https://...       # your Google Workspace MCP endpoint
GOOGLE_MCP_TOKEN=ya29....        # your OAuth access token

# Notion MCP
NOTION_MCP_TOKEN=secret_...      # your Notion internal integration token
```

### Google Workspace MCP setup

1. Visit https://workspace.google.com/products/mcp/ (check Google's current URL)
2. Authorize the MCP app for your Google account
3. Copy the endpoint URL → `GOOGLE_MCP_URL`
4. Copy the OAuth token → `GOOGLE_MCP_TOKEN`
5. Restart the dev server: `pnpm dev`

### Notion MCP setup

1. Go to https://www.notion.so/profile/integrations
2. Create a new integration (type: **Internal**)
3. Copy the **Internal Integration Token** → `NOTION_MCP_TOKEN`
4. Share any Notion pages the app should access with the integration
5. Restart the dev server: `pnpm dev`

---

## Writing a server action with MCP

The Daily Briefing app (`app/apps/daily-briefing/actions.ts`) is the canonical reference. Here's the annotated pattern:

```typescript
'use server'

import { createStreamableValue } from 'ai/rsc'
import { experimental_createMCPClient, streamText } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { createAnthropic } from '@ai-sdk/anthropic'

export type MyChunk =
  | { type: 'delta'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' }

export async function myAIAction() {
  const stream = createStreamableValue<MyChunk>()

  ;(async () => {
    // 1. Check env vars early — return a typed error if missing
    if (!process.env.GOOGLE_MCP_URL || !process.env.GOOGLE_MCP_TOKEN) {
      stream.update({ type: 'error', message: 'Google MCP not configured. Set GOOGLE_MCP_URL and GOOGLE_MCP_TOKEN in .env.' })
      stream.done()
      return
    }

    try {
      // 2. Connect to the MCP server
      const transport = new StreamableHTTPClientTransport(
        new URL(process.env.GOOGLE_MCP_URL),
        { requestInit: { headers: { Authorization: `Bearer ${process.env.GOOGLE_MCP_TOKEN}` } } },
      )
      const mcpClient = await experimental_createMCPClient({ transport })
      const tools = await mcpClient.tools()   // ← these become Claude's tools

      // 3. Stream with Claude
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const result = streamText({
        model: anthropic('claude-sonnet-4-6'),
        tools,
        maxSteps: 8,   // ← allows fetch → summarize multi-turn
        system: 'Your system prompt here.',
        messages: [{ role: 'user', content: 'Your prompt here.' }],
      })

      // 4. Forward chunks to the stream
      for await (const chunk of result.textStream) {
        stream.update({ type: 'delta', text: chunk })
      }
      stream.update({ type: 'done' })
    } catch (err) {
      stream.update({ type: 'error', message: err instanceof Error ? err.message : 'Failed.' })
    } finally {
      stream.done()
    }
  })()

  return { stream }
}
```

The page that consumes this must be a **Client Component** (`'use client'`) using `readStreamableValue` from `'ai/rsc'`:

```typescript
'use client'
import { readStreamableValue } from 'ai/rsc'
import { myAIAction, type MyChunk } from './actions'

// Inside your component:
const { stream } = await myAIAction()
for await (const chunk of readStreamableValue<MyChunk>(stream)) {
  if (chunk?.type === 'delta') setText((t) => t + chunk.text)
}
```

---

## Adding a new MCP server

To register a new server (e.g., GitHub, Stripe, Slack):

1. **`scripts/doctor.ts`** — add to `MCP_REQUIRED_VARS`:
   ```typescript
   github: ['GITHUB_MCP_URL', 'GITHUB_MCP_TOKEN'],
   ```

2. **`app/apps/hub/page.tsx`** — add to `MCP_REQUIRED_VARS`:
   ```typescript
   github: ['GITHUB_MCP_URL', 'GITHUB_MCP_TOKEN'],
   ```

3. **`.claude/agents/mcp-integrator.md`** — add a row to the Known MCP servers table and setup instructions.

4. **`.env.example`** — document the new env vars.

That's it. Apps can now declare `mcpServers: ['github']` in their manifest and the hub badge + doctor warnings will work automatically.

---

## `pnpm doctor` MCP checks

Running `pnpm doctor` reports the MCP status for each app that declares `mcpServers`:

```
App: daily-briefing

  MCP servers (daily-briefing):
  ✗ MCP "gmail" configured (GOOGLE_MCP_URL, GOOGLE_MCP_TOKEN)
  ✗ MCP "google-calendar" configured (GOOGLE_MCP_URL, GOOGLE_MCP_TOKEN)
```

MCP checks are **informational only** — they never fail the doctor or block commits. The app still runs and shows a clear error message to the user when MCP is not configured.

---

## Troubleshooting

**`MCPNotConfiguredError` / "Google MCP not configured"**
→ `GOOGLE_MCP_URL` or `GOOGLE_MCP_TOKEN` is missing or empty in `.env`. Restart the dev server after setting them.

**Token expiry**
→ Google OAuth tokens expire. Re-authorize at the Google Workspace MCP portal and update `GOOGLE_MCP_TOKEN`.

**No tools returned from `mcpClient.tools()`**
→ The MCP server connected but returned an empty tool list. Check that the OAuth token has the right scopes for the tools you need.

**CORS errors in the browser**
→ MCP calls happen in server actions — they run on the server, not in the browser. CORS is not a factor. If you see CORS errors, the code is running client-side by mistake.
