'use client'

import { useState } from 'react'
import { readStreamableValue } from 'ai/rsc'
import { generateBriefing, type BriefingChunk } from './actions'
import { AppContainer, PageHeader, Button } from '@hub/ui'

export default function DailyBriefingPage() {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setText('')
    setError(null)
    const { stream } = await generateBriefing()
    for await (const chunk of readStreamableValue<BriefingChunk>(stream)) {
      if (!chunk) continue
      if (chunk.type === 'delta') setText((t) => t + chunk.text)
      if (chunk.type === 'error') setError(chunk.message)
    }
    setLoading(false)
  }

  return (
    <AppContainer>
      <PageHeader title="Daily Briefing" subtitle="Gmail + Calendar" />
      <div className="mb-6">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Briefing'}
        </Button>
      </div>
      {error && (
        <div className="bg-orange-950 border border-orange-800 text-orange-300 rounded-xl p-4 text-sm mb-4">
          {error}
          <p className="mt-2 text-orange-400">
            Set the required env vars in .env and restart pnpm dev. See docs/mcp.md for setup instructions.
          </p>
        </div>
      )}
      {text && (
        <div className="prose prose-invert prose-sm max-w-none bg-zinc-900 rounded-xl p-6 border border-zinc-800 whitespace-pre-wrap text-zinc-300">
          {text}
        </div>
      )}
    </AppContainer>
  )
}
