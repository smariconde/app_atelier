import { execSync } from 'child_process'
import 'dotenv/config'

const adapter = process.env.DB_ADAPTER ?? 'sqlite'
console.log(`Running migrations (adapter: ${adapter})...`)

// Generate versioned SQL migration files from the current schema state.
execSync('pnpm drizzle-kit generate', { stdio: 'inherit' })

// Apply all pending migrations.
execSync('pnpm drizzle-kit migrate', { stdio: 'inherit' })

console.log('Migrations complete.')
