import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'daily-briefing',
  subdomain: 'daily-briefing',
  name: 'Daily Briefing',
  description: 'AI-powered summary of your Gmail and Calendar',
  icon: 'sun',
  color: '#38BDF8',
  enabled: true,
  status: 'experimental',
  pwa: {
    themeColor: '#38BDF8',
    backgroundColor: '#09090B',
    display: 'standalone',
  },
  mcpServers: ['gmail', 'google-calendar'],
  aiContext: {
    description: 'Morning briefing app using Gmail and Calendar via MCP',
    domain: 'productivity',
    examples: ['summarize my emails', 'what meetings do I have today'],
  },
})
