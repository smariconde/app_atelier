import { execSync } from 'child_process'
import 'dotenv/config'

const adapter = process.env.DB_ADAPTER ?? 'sqlite'
console.log(`Setting up database (adapter: ${adapter})...`)

// drizzle-kit push applies the current schema directly without generating migration files.
// Idempotent: safe to re-run, creates tables if they don't exist.
execSync('pnpm drizzle-kit push --force', { stdio: 'inherit' })

console.log('Database setup complete.')
