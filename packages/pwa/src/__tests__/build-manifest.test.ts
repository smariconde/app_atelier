import { describe, it, expect } from 'vitest'
import { buildPWAManifest } from '../build-manifest'
import type { AppManifest } from '@hub/core'

const baseApp: AppManifest = {
  id: 'notes',
  subdomain: 'notes',
  name: 'Notes',
  description: 'A note-taking app',
  icon: 'notebook-pen',
  color: '#F59E0B',
  enabled: true,
  status: 'stable',
  pwa: {
    themeColor: '#F59E0B',
    backgroundColor: '#09090B',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      { src: '/notes-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/notes-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/notes-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
}

describe('buildPWAManifest', () => {
  it('maps app name to both name and short_name', () => {
    const manifest = buildPWAManifest(baseApp)
    expect(manifest.name).toBe('Notes')
    expect(manifest.short_name).toBe('Notes')
  })

  it('maps description', () => {
    expect(buildPWAManifest(baseApp).description).toBe('A note-taking app')
  })

  it('sets start_url to "/"', () => {
    expect(buildPWAManifest(baseApp).start_url).toBe('/')
  })

  it('maps pwa.display', () => {
    expect(buildPWAManifest(baseApp).display).toBe('standalone')
  })

  it('maps pwa.backgroundColor to background_color', () => {
    expect(buildPWAManifest(baseApp).background_color).toBe('#09090B')
  })

  it('maps pwa.themeColor to theme_color', () => {
    expect(buildPWAManifest(baseApp).theme_color).toBe('#F59E0B')
  })

  it('maps pwa.orientation', () => {
    expect(buildPWAManifest(baseApp).orientation).toBe('portrait')
  })

  it('maps pwa.icons array', () => {
    const manifest = buildPWAManifest(baseApp)
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.icons?.[0].src).toBe('/notes-icon-192.png')
    expect(manifest.icons?.[2].purpose).toBe('maskable')
  })

  it('passes undefined description through when not provided', () => {
    const app: AppManifest = { ...baseApp, description: undefined }
    expect(buildPWAManifest(app).description).toBeUndefined()
  })

  it('passes undefined orientation through when not set', () => {
    const app: AppManifest = { ...baseApp, pwa: { ...baseApp.pwa, orientation: undefined } }
    expect(buildPWAManifest(app).orientation).toBeUndefined()
  })

  it('handles fullscreen display mode', () => {
    const app: AppManifest = { ...baseApp, pwa: { ...baseApp.pwa, display: 'fullscreen' } }
    expect(buildPWAManifest(app).display).toBe('fullscreen')
  })

  it('handles minimal-ui display mode', () => {
    const app: AppManifest = { ...baseApp, pwa: { ...baseApp.pwa, display: 'minimal-ui' } }
    expect(buildPWAManifest(app).display).toBe('minimal-ui')
  })

  it('handles browser display mode', () => {
    const app: AppManifest = { ...baseApp, pwa: { ...baseApp.pwa, display: 'browser' } }
    expect(buildPWAManifest(app).display).toBe('browser')
  })

  it('handles landscape orientation', () => {
    const app: AppManifest = { ...baseApp, pwa: { ...baseApp.pwa, orientation: 'landscape' } }
    expect(buildPWAManifest(app).orientation).toBe('landscape')
  })

  it('produces a new object (not the same reference as input)', () => {
    const manifest = buildPWAManifest(baseApp)
    expect(manifest).not.toBe(baseApp)
  })

  it('contains all required Next.js MetadataRoute.Manifest fields', () => {
    const manifest = buildPWAManifest(baseApp)
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('short_name')
    expect(manifest).toHaveProperty('start_url')
    expect(manifest).toHaveProperty('display')
    expect(manifest).toHaveProperty('background_color')
    expect(manifest).toHaveProperty('theme_color')
    expect(manifest).toHaveProperty('icons')
  })
})
