import { defineConfig } from 'drizzle-kit'
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
    case 'turso':
      return {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    case 'postgres':
      return { url: process.env.DATABASE_URL! }
    case 'mysql':
      return { url: process.env.DATABASE_URL! }
    case 'd1':
      return {
        wranglerConfigPath: './wrangler.toml',
        dbName: process.env.D1_DB_NAME ?? 'DB',
      }
    default:
      return { url: process.env.DATABASE_URL ?? './local.db' }
  }
}

export default defineConfig({
  dialect: dialectMap[adapter],
  // Auto-discovers all app schemas — no manual registration needed
  schema: './apps/*/db/schema.ts',
  out: `./drizzle/${adapter}`,
  dbCredentials: getCredentials(),
})
