import fs from 'fs-extra'
import path from 'path'

const root = path.resolve(process.cwd())
export const MANIFEST_FILE = path.join(root, 'app/manifest.ts')
export const HUB_FILE = path.join(root, 'app/apps/hub/page.tsx')

export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Add an app to app/manifest.ts (import + registry entry). No-op if already present. */
export function addToManifest(appId: string): void {
  const varName = toCamelCase(appId) + 'App'
  let content = fs.readFileSync(MANIFEST_FILE, 'utf-8')

  if (!content.includes(`from '../apps/${appId}/manifest'`)) {
    const matches = [...content.matchAll(/^import \w+App from '\.\.\/apps\/[^']+\/manifest'$/gm)]
    if (matches.length > 0) {
      const last = matches[matches.length - 1]
      const insertAt = last.index! + last[0].length
      content =
        content.slice(0, insertAt) +
        `\nimport ${varName} from '../apps/${appId}/manifest'` +
        content.slice(insertAt)
    }
  }

  if (!content.includes(`  ${appId}:`) && !content.includes(`  '${appId}':`)) {
    const entryMatches = [...content.matchAll(/^  ['"]?\w[\w-]*['"]?: \w+App,$/gm)]
    if (entryMatches.length > 0) {
      const last = entryMatches[entryMatches.length - 1]
      const insertAt = last.index! + last[0].length
      content =
        content.slice(0, insertAt) +
        `\n  ${appId}: ${varName},` +
        content.slice(insertAt)
    }
  }

  fs.writeFileSync(MANIFEST_FILE, content)
}

/** Remove an app from app/manifest.ts (import + registry entry). No-op if not present. */
export function removeFromManifest(appId: string): void {
  const varName = toCamelCase(appId) + 'App'
  const safeId = escapeRegex(appId)
  const safeVar = escapeRegex(varName)
  let content = fs.readFileSync(MANIFEST_FILE, 'utf-8')

  content = content.replace(
    new RegExp(`\nimport ${safeVar} from '\\.\\.\/apps\/${safeId}\/manifest'`),
    '',
  )
  content = content.replace(
    new RegExp(`\n  ['"]?${safeId}['"]?: ${safeVar},`),
    '',
  )

  fs.writeFileSync(MANIFEST_FILE, content)
}

/** Add an app to app/apps/hub/page.tsx (import + apps array). No-op if already present. */
export function addToHub(appId: string): void {
  const varName = toCamelCase(appId) + 'App'
  let content = fs.readFileSync(HUB_FILE, 'utf-8')

  if (!content.includes(`from '../../../apps/${appId}/manifest'`)) {
    const matches = [
      ...content.matchAll(/^import \w+App from '\.\.\/\.\.\/\.\.\/apps\/[^']+\/manifest'$/gm),
    ]
    if (matches.length > 0) {
      const last = matches[matches.length - 1]
      const insertAt = last.index! + last[0].length
      content =
        content.slice(0, insertAt) +
        `\nimport ${varName} from '../../../apps/${appId}/manifest'` +
        content.slice(insertAt)
    }
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

  fs.writeFileSync(HUB_FILE, content)
}

/** Remove an app from app/apps/hub/page.tsx (import + apps array). No-op if not present. */
export function removeFromHub(appId: string): void {
  const varName = toCamelCase(appId) + 'App'
  const safeId = escapeRegex(appId)
  const safeVar = escapeRegex(varName)
  let content = fs.readFileSync(HUB_FILE, 'utf-8')

  content = content.replace(
    new RegExp(`\nimport ${safeVar} from '\\.\\.\\/\\.\\.\\/\\.\\.\\/apps\\/${safeId}\\/manifest'`),
    '',
  )
  content = content.replace(
    /const apps: AppManifest\[\] = \[([^\]]*)\]/,
    (_: string, inner: string) => {
      const entries = inner
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s && s !== varName)
      return `const apps: AppManifest[] = [${entries.join(', ')}]`
    },
  )

  fs.writeFileSync(HUB_FILE, content)
}
