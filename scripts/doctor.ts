import 'dotenv/config'
import fs from 'fs-extra'
import path from 'path'
import { addToManifest, addToHub } from './lib/hub-registry'

const root = process.cwd()
const args = process.argv.slice(2)
const fixMode = args.includes('--fix')

const MCP_REQUIRED_VARS: Record<string, string[]> = {
  gmail:              ['GOOGLE_MCP_URL', 'GOOGLE_MCP_TOKEN'],
  'google-calendar':  ['GOOGLE_MCP_URL', 'GOOGLE_MCP_TOKEN'],
  drive:              ['GOOGLE_MCP_URL', 'GOOGLE_MCP_TOKEN'],
  notion:             ['NOTION_MCP_TOKEN'],
}

let errors = 0
let fixed = 0

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
  try { addToManifest(appDir); return true } catch { return false }
}

function fixHubPage(appDir: string): boolean {
  try { addToHub(appDir); return true } catch { return false }
}

console.log(`Running doctor checks${fixMode ? ' (--fix mode)' : ''}...\n`)

// ─── Adapter validation ───────────────────────────────────────────────────────
const validAdapters = ['sqlite', 'turso', 'postgres', 'mysql', 'd1']
const adapter = process.env.DB_ADAPTER ?? 'sqlite'

console.log('Database adapter:')
check(validAdapters.includes(adapter), `DB_ADAPTER="${adapter}" is valid (${validAdapters.join(' | ')})`)

if (adapter === 'turso') {
  const url = process.env.DATABASE_URL ?? ''
  check(
    url.startsWith('libsql://') || url.startsWith('libsql+ws://') || url.startsWith('file:'),
    'DATABASE_URL starts with libsql:// for turso adapter',
  )
  check(!!process.env.DATABASE_AUTH_TOKEN, 'DATABASE_AUTH_TOKEN is set for turso adapter')
} else if (adapter === 'postgres') {
  const url = process.env.DATABASE_URL ?? ''
  check(
    url.startsWith('postgresql://') || url.startsWith('postgres://'),
    'DATABASE_URL starts with postgresql:// for postgres adapter',
  )
} else if (adapter === 'mysql') {
  const url = process.env.DATABASE_URL ?? ''
  check(url.startsWith('mysql://'), 'DATABASE_URL starts with mysql:// for mysql adapter')
} else if (adapter === 'd1') {
  check(fs.existsSync(path.join(root, 'wrangler.toml')), 'wrangler.toml exists for d1 adapter')
}
check(fs.existsSync(path.join(root, 'drizzle.config.ts')), 'drizzle.config.ts exists')


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
  (() => {
    const nm = path.join(root, 'apps/_template/node_modules')
    if (!fs.existsSync(nm)) return true
    // pnpm workspace creates @hub/* symlinks here — that's expected and fine
    return fs.readdirSync(nm).every((d) => d.startsWith('@') || d.startsWith('.'))
  })(),
  'apps/_template/node_modules is clean (only workspace links allowed)',
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
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
      check(
        schemaContent.includes("from '@hub/db'"),
        `${appDir}/db/schema.ts imports from '@hub/db' (dialect-agnostic)`,
      )
    }

    const appManifestPath = path.join(appsDir, appDir, 'manifest.ts')
    if (fs.existsSync(appManifestPath)) {
      const appManifestContent = fs.readFileSync(appManifestPath, 'utf-8')
      const mcpMatch = appManifestContent.match(/mcpServers:\s*\[([^\]]*)\]/)
      if (mcpMatch) {
        const mcpIds = [...mcpMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
        console.log(`\n  MCP servers (${appDir}):`)
        for (const id of mcpIds) {
          const required = MCP_REQUIRED_VARS[id] ?? []
          const allSet = required.every((v) => !!process.env[v])
          // MCP is optional — informational only, never blocks commits
          if (allSet) {
            console.log(`  ✓ MCP "${id}" configured`)
          } else {
            console.log(`  ⚠ MCP "${id}" not configured (${required.join(', ')} — see docs/mcp.md)`)
          }
        }
      }
    }
  }
}

// ─── Studio skill validation ──────────────────────────────────────────────────

const skillsDir = path.join(root, '.claude', 'skills')
const agentsDir = path.join(root, '.claude', 'agents')

if (fs.existsSync(skillsDir) && fs.existsSync(agentsDir)) {
  const knownAgents = fs
    .readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))

  const skillDirs = fs
    .readdirSync(skillsDir)
    .filter((d) => fs.statSync(path.join(skillsDir, d)).isDirectory())

  console.log('\nStudio skills:')
  for (const skill of skillDirs) {
    const skillFile = path.join(skillsDir, skill, 'SKILL.md')
    check(fs.existsSync(skillFile), `skills/${skill}/SKILL.md exists`)

    if (fs.existsSync(skillFile)) {
      const content = fs.readFileSync(skillFile, 'utf-8')
      check(content.includes('name:'), `skills/${skill}/SKILL.md has 'name:' frontmatter`)
      check(content.includes('description:'), `skills/${skill}/SKILL.md has 'description:' frontmatter`)

      // Check 'agent: <name>' references point to known agents ('none' is a valid sentinel)
      const agentRefs = [...content.matchAll(/^agent:\s*(\S+)/gm)]
        .map((m) => m[1])
        .filter((r) => r !== 'none')
      for (const ref of agentRefs) {
        check(
          knownAgents.includes(ref),
          `skills/${skill}: referenced agent '${ref}' exists in .claude/agents/`,
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
