import { defineConfig } from 'drizzle-kit'
import { existsSync } from 'fs'
import 'dotenv/config'

const adapter = process.env.DB_ADAPTER ?? 'sqlite'

const dialectMap: Record<string, 'sqlite' | 'turso' | 'postgresql' | 'mysql'> = {
  sqlite: 'sqlite',
  turso: 'turso',
  d1: 'sqlite',
  postgres: 'postgresql',
  mysql: 'mysql',
}

function getCredentials() {
  switch (adapter) {
    case 'turso': {
      const url = process.env.DATABASE_URL
      if (!url) throw new Error('DATABASE_URL is required for Turso adapter')
      return {
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    }
    case 'postgres': {
      const url = process.env.DATABASE_URL
      if (!url) throw new Error('DATABASE_URL is required for Postgres adapter')
      return { url }
    }
    case 'mysql': {
      const url = process.env.DATABASE_URL
      if (!url) throw new Error('DATABASE_URL is required for MySQL adapter')
      return { url }
    }
    case 'd1': {
      const wranglerPath = './wrangler.toml'
      if (existsSync(wranglerPath)) {
        return {
          wranglerConfigPath: wranglerPath,
          dbName: process.env.D1_DB_NAME ?? 'DB',
        }
      }
      const url = process.env.DATABASE_URL
      if (!url) {
        throw new Error(
          'D1 requires either a wrangler.toml file or DATABASE_URL + DATABASE_AUTH_TOKEN env vars.\n' +
            'See docs/adapters/d1.md for setup instructions.',
        )
      }
      return { url, authToken: process.env.DATABASE_AUTH_TOKEN }
    }
    default:
      return { url: process.env.DATABASE_URL ?? './local.db' }
  }
}

export default defineConfig({
  dialect: dialectMap[adapter],
  schema: './apps/*/db/schema.ts',
  out: `./drizzle/${adapter}`,
  dbCredentials: getCredentials(),
})
