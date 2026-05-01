// v0.1: migration is handled by db-setup.ts
// This script is a placeholder for future migration tooling
import { execSync } from 'child_process'

console.log('Running db:setup (v0.1 uses single-step setup)...')
execSync('tsx scripts/db-setup.ts', { stdio: 'inherit' })
