/// <reference types="@cloudflare/workers-types" />

export function getDb(d1Binding?: D1Database) {
  const { drizzle } = require('drizzle-orm/d1') as typeof import('drizzle-orm/d1')

  const binding =
    d1Binding ?? (globalThis as unknown as { __D1_BINDING__?: D1Database }).__D1_BINDING__
  if (!binding) {
    throw new Error(
      'D1 binding not available. Set globalThis.__D1_BINDING__ = env.DB before calling getDb(), or pass the binding directly.',
    )
  }
  return drizzle(binding)
}
