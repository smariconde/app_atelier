import { describe, it, expect } from 'vitest'
import { buildAppUrl } from '../index'

describe('buildAppUrl', () => {
  it('uses https for a production domain', () => {
    expect(buildAppUrl('notes', 'example.com')).toBe('https://notes.example.com')
  })

  it('uses http for bare localhost', () => {
    expect(buildAppUrl('notes', 'localhost')).toBe('http://notes.localhost')
  })

  it('uses http for localhost with port', () => {
    expect(buildAppUrl('notes', 'localhost:3000')).toBe('http://notes.localhost:3000')
  })

  it('constructs correct subdomain.domain format', () => {
    expect(buildAppUrl('tasks', 'myapp.io')).toBe('https://tasks.myapp.io')
  })

  it('uses http for any domain containing "localhost"', () => {
    expect(buildAppUrl('dev', 'dev.localhost')).toBe('http://dev.dev.localhost')
  })

  it('handles vercel preview domains (https)', () => {
    expect(buildAppUrl('notes', 'app-atelier.vercel.app')).toBe('https://notes.app-atelier.vercel.app')
  })

  it('handles disabled state (enabled: false app)', () => {
    // buildAppUrl is subdomain/domain agnostic — still constructs the URL
    expect(buildAppUrl('habits', 'example.com')).toBe('https://habits.example.com')
  })

  it('produces a valid URL format', () => {
    const url = buildAppUrl('notes', 'example.com')
    expect(() => new URL(url)).not.toThrow()
  })
})
