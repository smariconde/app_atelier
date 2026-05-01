import fs from 'fs-extra'
import path from 'path'

const root = process.cwd()
const args = process.argv.slice(2)
const fixMode = args.includes('--fix')

let errors = 0
let fixed = 0

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
}

function check(condition: boolean, message: string, fixFn?: () => boolean) {
  if (condition) {
    console.log(`  ✓ ${message}`)
  } else if (fixMode && fixFn) {
    try {
      const success = fixFn()
      if (success) {
        console.log(`  ✓ ${message} [FIXED]`)
        fixed++
      } else {
        console.error(`  ✗ ${message} [MANUAL]`)
        errors++
      }
    } catch {
      console.error(`  ✗ ${message} [FIX FAILED]`)
      errors++
    }
  } else {
    console.error(`  ✗ ${message}`)
    errors++
  }
}

function fixManifestRegistry(appDir: string): boolean {
  const manifestPath = path.join(root, 'app/manifest.ts')
  let content = fs.readFileSync(manifestPath, 'utf-8')
  const varName = toCamelCase(appDir) + 'App'

  if (!content.includes(`from '../apps/${appDir}/manifest'`)) {
    const matches = [...content.matchAll(/^import \w+App from '\.\.\/apps\/[^']+\/manifest'$/gm)]
    if (matches.length === 0) return false
    const last = matches[matches.length - 1]
    const insertAt = last.index! + last[0].length
    content =
      content.slice(0, insertAt) +
      `\nimport ${varName} from '../apps/${appDir}/manifest'` +
      content.slice(insertAt)
  }

  if (!content.includes(`  ${appDir}:`)) {
    const entryMatches = [...content.matchAll(/^  \w[\w-]*: \w+App,$/gm)]
    if (entryMatches.length === 0) return false
    const last = entryMatches[entryMatches.length - 1]
    const insertAt = last.index! + last[0].length
    content =
      content.slice(0, insertAt) +
      `\n  ${appDir}: ${varName},` +
      content.slice(insertAt)
  }

  fs.writeFileSync(manifestPath, content)
  return true
}

function fixHubPage(appDir: string): boolean {
  const hubPath = path.join(root, 'app/apps/hub/page.tsx')
  let content = fs.readFileSync(hubPath, 'utf-8')
  const varName = toCamelCase(appDir) + 'App'

  if (!content.includes(`from '../../../apps/${appDir}/manifest'`)) {
    const matches = [
      ...content.matchAll(/^import \w+App from '\.\.\/\.\.\/\.\.\/apps\/[^']+\/manifest'$/gm),
    ]
    if (matches.length === 0) return false
    const last = matches[matches.length - 1]
    const insertAt = last.index! + last[0].length
    content =
      content.slice(0, insertAt) +
      `\nimport ${varName} from '../../../apps/${appDir}/manifest'` +
      content.slice(insertAt)
  }

  if (!content.includes(varName)) {
    content = content.replace(
      /const apps: AppManifest\[\] = \[([^\]]*)\]/,
      (_: string, inner: string) => {
        const entries = inner
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        if (!entries.includes(varName)) entries.push(varName)
        return `const apps: AppManifest[] = [${entries.join(', ')}]`
      },
    )
  }

  fs.writeFileSync(hubPath, content)
  return true
}

console.log(`Running doctor checks${fixMode ? ' (--fix mode)' : ''}...\n`)

console.log('Packages:')
check(fs.existsSync(path.join(root, 'packages/core/src/index.ts')), '@hub/core exists')
check(fs.existsSync(path.join(root, 'packages/db/src/index.ts')), '@hub/db exists')
check(fs.existsSync(path.join(root, 'packages/auth/src/index.ts')), '@hub/auth exists')
check(fs.existsSync(path.join(root, 'packages/ui/src/index.ts')), '@hub/ui exists')
check(fs.existsSync(path.join(root, 'packages/pwa/src/index.ts')), '@hub/pwa exists')

console.log('\nConfig:')
check(fs.existsSync(path.join(root, 'next.config.ts')), 'next.config.ts')
check(fs.existsSync(path.join(root, 'middleware.ts')), 'middleware.ts')
check(fs.existsSync(path.join(root, 'pnpm-workspace.yaml')), 'pnpm-workspace.yaml')
check(fs.existsSync(path.join(root, 'turbo.json')), 'turbo.json')
check(fs.existsSync(path.join(root, '.env.example')), '.env.example')

console.log('\nScaffold:')
check(
  !fs.existsSync(path.join(root, 'apps/_template/node_modules')),
  'apps/_template/node_modules is clean',
)

console.log('\nHub:')
check(fs.existsSync(path.join(root, 'app/apps/hub/page.tsx')), 'app/apps/hub/page.tsx')

const appsDir = path.join(root, 'apps')
if (fs.existsSync(appsDir)) {
  const appDirs = fs
    .readdirSync(appsDir)
    .filter((d) => {
      if (d.startsWith('_') || d === 'hub') return false
      return fs.statSync(path.join(appsDir, d)).isDirectory()
    })
    .sort()

  const manifestContent = fs.readFileSync(path.join(root, 'app/manifest.ts'), 'utf-8')
  const hubContent = fs.readFileSync(path.join(root, 'app/apps/hub/page.tsx'), 'utf-8')

  for (const appDir of appDirs) {
    console.log(`\nApp: ${appDir}`)

    check(
      fs.existsSync(path.join(appsDir, appDir, 'manifest.ts')),
      `apps/${appDir}/manifest.ts exists`,
    )

    check(
      fs.existsSync(path.join(root, `app/apps/${appDir}/page.tsx`)),
      `app/apps/${appDir}/page.tsx exists`,
    )

    check(
      manifestContent.includes(`from '../apps/${appDir}/manifest'`) ||
        manifestContent.includes(`from "../apps/${appDir}/manifest"`),
      `${appDir} wired in app/manifest.ts`,
      () => fixManifestRegistry(appDir),
    )

    check(
      hubContent.includes(`from '../../../apps/${appDir}/manifest'`) ||
        hubContent.includes(`from "../../../apps/${appDir}/manifest"`),
      `${appDir} wired in hub page.tsx`,
      () => fixHubPage(appDir),
    )

    const schemaPath = path.join(appsDir, appDir, 'db/schema.ts')
    if (fs.existsSync(schemaPath)) {
      const manifestAppContent = fs.readFileSync(path.join(appsDir, appDir, 'manifest.ts'), 'utf-8')
      const prefixMatch = manifestAppContent.match(/tablePrefix:\s*['"]([^'"]+)['"]/)
      const tablePrefix = prefixMatch?.[1]
      if (tablePrefix) {
        const dbSetupContent = fs.readFileSync(path.join(root, 'scripts/db-setup.ts'), 'utf-8')
        check(
          dbSetupContent.includes(`CREATE TABLE IF NOT EXISTS ${tablePrefix}`),
          `${appDir} has CREATE TABLE in scripts/db-setup.ts`,
        )
      }
    }
  }
}

const fixedNote = fixed > 0 ? ` (${fixed} auto-fixed)` : ''
console.log(
  `\n${errors === 0 ? `✓ All checks passed${fixedNote}` : `✗ ${errors} check(s) failed${fixedNote}`}`,
)
if (fixMode && fixed > 0) console.log('  Run `pnpm doctor` to verify all fixes.')
process.exit(errors > 0 ? 1 : 0)
