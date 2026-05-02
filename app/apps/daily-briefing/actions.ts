'use server'

import { createStreamableValue } from 'ai/rsc'
import { experimental_createMCPClient, streamText } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { createAnthropic } from '@ai-sdk/anthropic'

export type BriefingChunk =
  | { type: 'delta'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' }

export async function generateBriefing() {
  const stream = createStreamableValue<BriefingChunk>()

  ;(async () => {
    const googleUrl = process.env.GOOGLE_MCP_URL
    const googleToken = process.env.GOOGLE_MCP_TOKEN

    if (!googleUrl || !googleToken) {
      stream.update({
        type: 'error',
        message: 'Google MCP not configured. Set GOOGLE_MCP_URL and GOOGLE_MCP_TOKEN in .env.',
      })
      stream.done()
      return
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      stream.update({
        type: 'error',
        message: 'ANTHROPIC_API_KEY not set in .env.',
      })
      stream.done()
      return
    }

    try {
      const transport = new StreamableHTTPClientTransport(new URL(googleUrl), {
        requestInit: { headers: { Authorization: `Bearer ${googleToken}` } },
      })
      const mcpClient = await experimental_createMCPClient({ transport })
      const tools = await mcpClient.tools()

      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const result = streamText({
        model: anthropic('claude-sonnet-4-6'),
        tools,
        maxSteps: 8,
        system: `You are a morning briefing assistant. Use Gmail tools to fetch unread emails
from the last 24 hours. Use Calendar tools to fetch today's events. Present calendar events
first (sorted by time), then email summary (grouped by sender, skip marketing/newsletters).
Be brief and scannable. Use markdown for structure.`,
        messages: [{ role: 'user', content: "Give me today's briefing." }],
      })

      for await (const chunk of result.textStream) {
        stream.update({ type: 'delta', text: chunk })
      }
      stream.update({ type: 'done' })
    } catch (err) {
      stream.update({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to generate briefing.',
      })
    } finally {
      stream.done()
    }
  })()

  return { stream: stream.value }
}
