import fs from 'fs-extra'
import path from 'path'

const root = process.cwd()

const appsDir = path.join(root, 'apps')
const appDirs = fs.existsSync(appsDir)
  ? fs
      .readdirSync(appsDir)
      .filter((d) => {
        if (d.startsWith('_') || d === 'hub') return false
        return fs.statSync(path.join(appsDir, d)).isDirectory()
      })
      .sort()
  : []

function parseField(content: string, field: string): string {
  const m = content.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`))
  return m?.[1] ?? '?'
}

const count = appDirs.length
console.log(`\nAppAtelier Studio — ${count} app${count !== 1 ? 's' : ''}\n`)

for (const appDir of appDirs) {
  const manifestPath = path.join(appsDir, appDir, 'manifest.ts')
  if (!fs.existsSync(manifestPath)) continue

  const content = fs.readFileSync(manifestPath, 'utf-8')
  const status = parseField(content, 'status')
  const hasStaticIcon = fs.existsSync(path.join(root, 'public', `${appDir}-icon-192.png`))
  const hasExplicitIcons = content.includes('icons:') && content.includes('src:')
  const iconsLabel = hasStaticIcon ? 'static' : hasExplicitIcons ? 'missing' : 'dynamic'

  const appCol = appDir.padEnd(12)
  const statusCol = status.padEnd(12)
  const urlCol = `${appDir}.localhost:3000`.padEnd(28)
  console.log(`  ✓ ${appCol} ${statusCol} ${urlCol} icons: ${iconsLabel}`)
}

const agentsDir = path.join(root, '.claude', 'agents')
const agents = fs.existsSync(agentsDir)
  ? fs
      .readdirSync(agentsDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace('.md', ''))
      .sort()
  : []

const skillsDir = path.join(root, '.claude', 'skills')
const skills = fs.existsSync(skillsDir)
  ? fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => {
        if (entry.isDirectory()) {
          return fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))
        }
        return entry.isFile() && entry.name.endsWith('.md')
      })
      .map((entry) => '/' + entry.name.replace(/\.md$/, ''))
      .sort()
  : []

const settingsPath = path.join(root, '.claude', 'settings.json')
const hasHooks = fs.existsSync(settingsPath)

console.log(`\nStudio agents: ${agents.join(', ') || 'none'}`)
console.log(`Skills:        ${skills.join('  ') || 'none'}`)
console.log(
  `Hooks:         ${hasHooks ? 'PreCommit(doctor)  PostEdit(manifest-sync)  SessionStart(this)' : 'not configured'}`,
)
console.log()
