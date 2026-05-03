import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

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

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const root = path.resolve(process.cwd())
const workspaceDir = path.join(root, 'apps', appId)
const nextDir = path.join(root, 'app', 'apps', appId)
const manifestFile = path.join(root, 'app', 'manifest.ts')
const hubFile = path.join(root, 'app', 'apps', 'hub', 'page.tsx')

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
  const varName = toCamelCase(appId) + 'App'
  const safeId = escapeRegex(appId)
  const safeVar = escapeRegex(varName)

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

  // 4. Edit app/manifest.ts
  let manifestContent = fs.readFileSync(manifestFile, 'utf-8')

  // Remove import line (e.g. import dailyBriefingApp from '../apps/daily-briefing/manifest')
  manifestContent = manifestContent.replace(
    new RegExp(`\nimport ${safeVar} from '\\.\\.\/apps\/${safeId}\/manifest'`),
    '',
  )

  // Remove registry entry (handles both `notes: notesApp,` and `'daily-briefing': dailyBriefingApp,`)
  manifestContent = manifestContent.replace(
    new RegExp(`\n  ['"]?${safeId}['"]?: ${safeVar},`),
    '',
  )

  fs.writeFileSync(manifestFile, manifestContent)
  console.log('✓ Updated app/manifest.ts')

  // 5. Edit app/apps/hub/page.tsx
  let hubContent = fs.readFileSync(hubFile, 'utf-8')

  // Remove import line
  hubContent = hubContent.replace(
    new RegExp(`\nimport ${safeVar} from '\\.\\.\\/\\.\\.\\/\\.\\.\\/apps\\/${safeId}\\/manifest'`),
    '',
  )

  // Remove from apps array
  hubContent = hubContent.replace(
    /const apps: AppManifest\[\] = \[([^\]]*)\]/,
    (_: string, inner: string) => {
      const entries = inner
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s && s !== varName)
      return `const apps: AppManifest[] = [${entries.join(', ')}]`
    },
  )

  fs.writeFileSync(hubFile, hubContent)
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
