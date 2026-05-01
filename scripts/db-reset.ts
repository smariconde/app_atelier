import { unlinkSync, existsSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import 'dotenv/config'

const adapter = process.env.DB_ADAPTER ?? 'sqlite'
const args = process.argv.slice(2)
const force = args.includes('--force')

if ((adapter === 'postgres' || adapter === 'mysql') && !force) {
  console.error(
    `ERROR: db:reset on adapter "${adapter}" requires --force flag to prevent accidental data loss.`,
  )
  console.error('  Run: pnpm db:reset -- --force')
  process.exit(1)
}

if (adapter === 'sqlite' || adapter === 'd1') {
  const dbPath = path.resolve(process.env.DATABASE_URL ?? './local.db')
  for (const suffix of ['', '-wal', '-shm']) {
    const p = dbPath + suffix
    if (existsSync(p)) {
      unlinkSync(p)
      console.log(`Deleted ${p}`)
    }
  }
} else {
  // For postgres/mysql/turso: drop all app tables via drizzle-kit drop
  console.log(`Dropping all tables (adapter: ${adapter})...`)
  execSync('pnpm drizzle-kit drop --force', { stdio: 'inherit' })
}

console.log('Re-running setup...')
execSync('tsx scripts/db-setup.ts', { stdio: 'inherit' })
