import fs from 'fs-extra'
import path from 'path'

const appName = process.argv[2]

if (!appName) {
  console.error('Usage: pnpm new-app <name>')
  console.error('Example: pnpm new-app finance')
  process.exit(1)
}

const appId = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
const appDisplayName = appName.charAt(0).toUpperCase() + appName.slice(1)

const root = path.resolve(process.cwd())
const templateAppsDir = path.join(root, 'apps', '_template')
const newAppsDir = path.join(root, 'apps', appId)
const templateNextDir = path.join(root, 'app', 'apps', '_template')
const newNextDir = path.join(root, 'app', 'apps', appId)

if (!fs.existsSync(templateAppsDir)) {
  console.error('Template not found at apps/_template')
  process.exit(1)
}

// Copy workspace package
fs.copySync(templateAppsDir, newAppsDir, {
  filter: (src) => !src.includes('node_modules'),
})

// Replace placeholders in workspace package
const appsFiles = fs.readdirSync(newAppsDir, { withFileTypes: true })
function replaceInDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      replaceInDir(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.json'))) {
      let content = fs.readFileSync(fullPath, 'utf8')
      content = content.replaceAll('__APP_ID__', appId).replaceAll('__APP_NAME__', appDisplayName)
      fs.writeFileSync(fullPath, content)
    }
  }
}
replaceInDir(newAppsDir)

// Create Next.js route directory
fs.ensureDirSync(newNextDir)

// Create basic layout
fs.writeFileSync(
  path.join(newNextDir, 'layout.tsx'),
  `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${appDisplayName}',
}

export default function ${appDisplayName}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`
)

// Create basic page
fs.writeFileSync(
  path.join(newNextDir, 'page.tsx'),
  `export default function ${appDisplayName}Page() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <h1 className="text-2xl font-bold text-white">${appDisplayName}</h1>
    </main>
  )
}
`
)

// Generate CLAUDE.md for workspace package
fs.writeFileSync(
  path.join(newAppsDir, 'CLAUDE.md'),
  `# apps/${appId}/

${appDisplayName} app workspace package.

## Manifest

- **id / subdomain**: \`${appId}\` → \`${appId}.localhost:3000\` in dev
- **tablePrefix**: \`${appId}_\` (all table names must start with this)
- Edit \`manifest.ts\` to set \`icon\`, \`color\`, \`description\`, \`pwa.themeColor\`

## Database schema

\`db/schema.ts\` — define Drizzle tables here. Table names must start with \`${appId}_\`.

## UI routes

Pages live in \`app/apps/${appId}/\`:
- \`page.tsx\` — main list/home view
- \`actions.ts\` — \`'use server'\` CRUD server actions
- \`[id]/page.tsx\` — detail/edit view (add if needed)

## Next steps to complete setup

1. Edit \`manifest.ts\` — set icon, color, description
2. Add import to \`app/manifest.ts\` registry
3. Add to \`app/apps/hub/page.tsx\` apps array
4. Define schema in \`db/schema.ts\`
5. Run \`pnpm db:setup\`
6. Implement \`app/apps/${appId}/page.tsx\` and \`actions.ts\`
(Icons auto-generated from manifest icon + color — no setup needed)
`
)

console.log(`
✓ Created apps/${appId}/           (workspace package + manifest)
✓ Created app/apps/${appId}/       (Next.js routes)

Next steps:
  1. Edit apps/${appId}/manifest.ts  — set icon, color, description
  2. Add import to app/manifest.ts:
       import ${appId}App from '../apps/${appId}/manifest'
       // add to registry: ${appId}: ${appId}App
  3. Add to hub page in app/apps/hub/page.tsx:
       import ${appId}App from '../../../apps/${appId}/manifest'
       // add to apps array
  4. Run: pnpm db:setup   (to create tables)
  (Icons auto-generated from manifest icon + color — no manual step needed)
`)
