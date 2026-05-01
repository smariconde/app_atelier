import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '@hub/db'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: 'sqlite' }),
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    },
  },
})

export type Session = typeof auth.$Infer.Session
