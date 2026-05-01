import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '@hub/db'

const dbAdapter = process.env.DB_ADAPTER ?? 'sqlite'
const provider = dbAdapter === 'postgres' ? 'pg' : dbAdapter === 'mysql' ? 'mysql' : 'sqlite'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider }),
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    },
  },
})

export type Session = typeof auth.$Infer.Session
