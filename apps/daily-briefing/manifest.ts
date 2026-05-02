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
    icons: [
      { src: '/daily-briefing-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/daily-briefing-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/daily-briefing-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  mcpServers: ['gmail', 'google-calendar'],
  aiContext: {
    description: 'Morning briefing app using Gmail and Calendar via MCP',
    domain: 'productivity',
    examples: ['summarize my emails', 'what meetings do I have today'],
  },
})
