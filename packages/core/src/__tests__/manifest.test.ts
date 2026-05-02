import { describe, it, expect } from 'vitest'
import { defineManifest } from '../manifest'
import type { AppManifest } from '../manifest'

const minimalManifest: AppManifest = {
  id: 'test-app',
  subdomain: 'test',
  name: 'Test App',
  icon: 'circle',
  color: '#000000',
  enabled: true,
  status: 'stable',
  pwa: {
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

describe('defineManifest', () => {
  it('returns the same object reference (identity function)', () => {
    const result = defineManifest(minimalManifest)
    expect(result).toBe(minimalManifest)
  })

  it('preserves all required fields', () => {
    const result = defineManifest(minimalManifest)
    expect(result.id).toBe('test-app')
    expect(result.subdomain).toBe('test')
    expect(result.name).toBe('Test App')
    expect(result.icon).toBe('circle')
    expect(result.color).toBe('#000000')
    expect(result.enabled).toBe(true)
    expect(result.status).toBe('stable')
  })

  it('preserves pwa sub-object', () => {
    const result = defineManifest(minimalManifest)
    expect(result.pwa.themeColor).toBe('#000000')
    expect(result.pwa.backgroundColor).toBe('#ffffff')
    expect(result.pwa.display).toBe('standalone')
    expect(result.pwa.icons).toHaveLength(1)
    expect(result.pwa.icons[0].src).toBe('/icon-192.png')
  })

  it('leaves optional description undefined when not provided', () => {
    const result = defineManifest(minimalManifest)
    expect(result.description).toBeUndefined()
  })

  it('preserves description when provided', () => {
    const result = defineManifest({ ...minimalManifest, description: 'A test app' })
    expect(result.description).toBe('A test app')
  })

  it('preserves database config when provided', () => {
    const result = defineManifest({
      ...minimalManifest,
      database: { schemaPath: './db/schema.ts', tablePrefix: 'test_' },
    })
    expect(result.database?.schemaPath).toBe('./db/schema.ts')
    expect(result.database?.tablePrefix).toBe('test_')
  })

  it('preserves aiContext when provided', () => {
    const result = defineManifest({
      ...minimalManifest,
      aiContext: {
        description: 'AI desc',
        domain: 'productivity',
        examples: ['do X', 'find Y'],
      },
    })
    expect(result.aiContext?.domain).toBe('productivity')
    expect(result.aiContext?.examples).toHaveLength(2)
  })

  it('preserves mcpServers array when provided', () => {
    const result = defineManifest({ ...minimalManifest, mcpServers: ['gmail', 'notion'] })
    expect(result.mcpServers).toEqual(['gmail', 'notion'])
  })

  it('handles all valid status values', () => {
    const statuses: AppManifest['status'][] = ['stable', 'beta', 'experimental']
    for (const status of statuses) {
      expect(defineManifest({ ...minimalManifest, status }).status).toBe(status)
    }
  })

  it('handles all valid pwa display values', () => {
    const displays: AppManifest['pwa']['display'][] = [
      'standalone', 'fullscreen', 'minimal-ui', 'browser',
    ]
    for (const display of displays) {
      const result = defineManifest({ ...minimalManifest, pwa: { ...minimalManifest.pwa, display } })
      expect(result.pwa.display).toBe(display)
    }
  })

  it('preserves pwa orientation when provided', () => {
    const result = defineManifest({
      ...minimalManifest,
      pwa: { ...minimalManifest.pwa, orientation: 'portrait' },
    })
    expect(result.pwa.orientation).toBe('portrait')
  })

  it('preserves maskable icon purpose', () => {
    const result = defineManifest({
      ...minimalManifest,
      pwa: {
        ...minimalManifest.pwa,
        icons: [{ src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
      },
    })
    expect(result.pwa.icons[0].purpose).toBe('maskable')
  })
})
