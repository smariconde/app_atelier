/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1'

// D1 requires the CF Worker binding passed per-request (from CF Pages/Worker env).
// In a Next.js on Cloudflare Pages context, set globalThis.__D1_BINDING__ = env.DB
// in your CF Pages Function entry point before calling the Next.js handler.
export function getDb(d1Binding?: D1Database) {
  const binding =
    d1Binding ?? (globalThis as unknown as { __D1_BINDING__?: D1Database }).__D1_BINDING__
  if (!binding) {
    throw new Error(
      'D1 binding not available. Set globalThis.__D1_BINDING__ = env.DB before calling getDb(), or pass the binding directly.',
    )
  }
  return drizzle(binding)
}
