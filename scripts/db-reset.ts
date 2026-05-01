import { unlinkSync, existsSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const dbPath = path.resolve(process.env.DATABASE_URL ?? './local.db')

if (existsSync(dbPath)) {
  unlinkSync(dbPath)
  console.log(`Deleted ${dbPath}`)
}

const walPath = dbPath + '-wal'
const shmPath = dbPath + '-shm'
if (existsSync(walPath)) unlinkSync(walPath)
if (existsSync(shmPath)) unlinkSync(shmPath)

console.log('Re-running setup...')
execSync('tsx scripts/db-setup.ts', { stdio: 'inherit' })
