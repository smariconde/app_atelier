import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import { removeFromManifest, removeFromHub } from './lib/hub-registry'

const args = process.argv.slice(2)
const appName = args.find((a) => !a.startsWith('--'))
const yes = args.includes('--yes')

if (!appName) {
  console.error('Usage: pnpm delete-app <name> [--yes]')
  console.error('Example: pnpm delete-app finance')
  console.error('')
  console.error('  --yes   Skip confirmation prompt')
  process.exit(1)
}

const appId = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')

const root = path.resolve(process.cwd())
const workspaceDir = path.join(root, 'apps', appId)
const nextDir = path.join(root, 'app', 'apps', appId)

// ─── Validate ────────────────────────────────────────────────────────────────

if (!fs.existsSync(workspaceDir)) {
  console.error(`✗ App "${appId}" not found at apps/${appId}/`)
  console.error('  Run pnpm studio-status to see existing apps.')
  process.exit(1)
}

// ─── Collect icon files ───────────────────────────────────────────────────────

const iconFiles = [`${appId}-icon-192.png`, `${appId}-icon-512.png`, `${appId}-icon-maskable.png`]
  .map((f) => path.join(root, 'public', f))
  .filter((f) => fs.existsSync(f))

// ─── Dry-run summary ─────────────────────────────────────────────────────────

console.log(`\nDeleting app: ${appId}\n`)
console.log('Directories to remove:')
console.log(`  apps/${appId}/`)
if (fs.existsSync(nextDir)) console.log(`  app/apps/${appId}/`)
if (iconFiles.length > 0) {
  console.log('\nIcons to remove:')
  for (const f of iconFiles) console.log(`  public/${path.basename(f)}`)
}
console.log('\nRegistry files to update:')
console.log('  app/manifest.ts        (import + registry entry)')
console.log('  app/apps/hub/page.tsx  (import + apps array entry)')
console.log('')
console.log('⚠  Database tables will NOT be dropped.')
console.log('   Run pnpm db:reset to recreate only the remaining apps.')
console.log('')

// ─── Confirmation ─────────────────────────────────────────────────────────────

if (!yes) {
  const readline = require('readline')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question(`Type "${appId}" to confirm: `, (answer: string) => {
    rl.close()
    if (answer.trim() !== appId) {
      console.log('Aborted.')
      process.exit(0)
    }
    run()
  })
} else {
  run()
}

// ─── Deletion ────────────────────────────────────────────────────────────────

function run() {
  // 1. Delete workspace package
  fs.removeSync(workspaceDir)
  console.log(`✓ Removed apps/${appId}/`)

  // 2. Delete Next.js routes
  if (fs.existsSync(nextDir)) {
    fs.removeSync(nextDir)
    console.log(`✓ Removed app/apps/${appId}/`)
  }

  // 3. Delete PWA icons
  for (const f of iconFiles) {
    fs.removeSync(f)
    console.log(`✓ Removed public/${path.basename(f)}`)
  }

  // 4. Edit registry files via shared helper
  removeFromManifest(appId)
  console.log('✓ Updated app/manifest.ts')

  removeFromHub(appId)
  console.log('✓ Updated app/apps/hub/page.tsx')

  // 6. Verify
  console.log('\nRunning pnpm doctor...\n')
  try {
    execSync('pnpm doctor', { cwd: root, stdio: 'inherit' })
  } catch {
    console.error('\n⚠  Doctor reported issues — review the output above.')
    process.exit(1)
  }

  console.log(`\n✓ "${appId}" deleted successfully.`)
  console.log('\nNext steps (if needed):')
  console.log('  pnpm db:reset   — drop + recreate tables for remaining apps')
  console.log('  git add -A && git commit -m "chore: remove <app> app"')
}
