/**
 * scripts/audit.ts
 *
 * Runs Lighthouse CI against all enabled AppAtelier apps at a given base URL.
 * Usage: tsx scripts/audit.ts --url https://yourdomain.com [--threshold 90]
 *
 * Each app is audited at https://<subdomain>.<domain>.
 * The hub is audited at the root domain.
 * Exits 0 if all scores meet the threshold, 1 if any fail.
 */

import { spawnSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

const root = process.cwd()
const args = process.argv.slice(2)

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx !== -1 ? args[idx + 1] : undefined
}

const baseUrl = getArg('--url')
const threshold = parseInt(getArg('--threshold') ?? '90', 10)

if (!baseUrl) {
  console.error('Usage: tsx scripts/audit.ts --url https://yourdomain.com [--threshold 90]')
  process.exit(1)
}

// Parse base domain from URL (e.g. "https://yourdomain.com" → "yourdomain.com")
const parsedUrl = new URL(baseUrl)
const baseDomain = parsedUrl.hostname // e.g. "yourdomain.com" or "app-atelier-abc.vercel.app"
const protocol = parsedUrl.protocol   // "https:"

// Discover enabled apps
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

interface AppEntry {
  id: string
  subdomain: string
  name: string
  url: string
}

const apps: AppEntry[] = []

for (const appDir of appDirs) {
  const manifestPath = path.join(appsDir, appDir, 'manifest.ts')
  if (!fs.existsSync(manifestPath)) continue

  const content = fs.readFileSync(manifestPath, 'utf-8')
  const enabledMatch = content.match(/enabled:\s*(true|false)/)
  if (enabledMatch?.[1] !== 'true') continue

  const subdomainMatch = content.match(/subdomain:\s*['"]([^'"]+)['"]/)
  const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/)
  const subdomain = subdomainMatch?.[1] ?? appDir
  const name = nameMatch?.[1] ?? appDir

  apps.push({
    id: appDir,
    subdomain,
    name,
    url: `${protocol}//${subdomain}.${baseDomain}`,
  })
}

// Build URL list: hub first, then apps
const auditTargets: { label: string; url: string }[] = [
  { label: 'hub', url: `${protocol}//${baseDomain}` },
  ...apps.map((a) => ({ label: a.id, url: a.url })),
]

console.log(`\nAppAtelier QA Audit`)
console.log(`Base URL: ${baseUrl}`)
console.log(`Threshold: ${threshold}`)
console.log(`Apps: ${apps.map((a) => a.id).join(', ') || 'none'}`)
console.log(`\nAuditing ${auditTargets.length} URL(s)...\n`)

// Build lhci collect command with all URLs
const urlFlags = auditTargets.map((t) => `--url=${t.url}`).join(' ')

// Clean up previous report
const reportDir = path.join(root, '.lighthouseci')
if (fs.existsSync(reportDir)) {
  fs.removeSync(reportDir)
}

// Run lhci collect
console.log('Running Lighthouse CI collect...')
const collectResult = spawnSync(
  'npx',
  ['lhci', 'collect', ...auditTargets.map((t) => `--url=${t.url}`), '--numberOfRuns=1', `--config=${path.join(root, 'lighthouserc.js')}`],
  { stdio: 'inherit', cwd: root },
)

if (collectResult.status !== 0) {
  console.error('\n✗ Lighthouse collect failed. Is Chrome installed?')
  console.error('  Install Chrome or run: npx puppeteer browsers install chrome')
  process.exit(1)
}

// Parse results from .lighthouseci/manifest.json
const manifestPath = path.join(reportDir, 'manifest.json')
if (!fs.existsSync(manifestPath)) {
  console.error('\n✗ No Lighthouse results found. Collect may have failed silently.')
  process.exit(1)
}

interface LHRManifestEntry {
  url: string
  isRepresentativeRun: boolean
  jsonPath: string
  summary: {
    performance: number
    accessibility: number
    'best-practices': number
    seo: number
    pwa: number
  }
}

const manifest: LHRManifestEntry[] = fs.readJsonSync(manifestPath)

// Filter to representative runs only
const runs = manifest.filter((r) => r.isRepresentativeRun)

// Score table
const categories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'] as const
type Category = typeof categories[number]

interface AppResult {
  label: string
  url: string
  scores: Record<Category, number>
  status: 'pass' | 'fail'
  failures: string[]
}

const results: AppResult[] = []

for (const run of runs) {
  const matchedTarget = auditTargets.find((t) => t.url === run.url || run.url.startsWith(t.url))
  const label = matchedTarget?.label ?? run.url

  const scores = {} as Record<Category, number>
  const failures: string[] = []

  for (const cat of categories) {
    const score = Math.round((run.summary[cat] ?? 0) * 100)
    scores[cat] = score
    if (score < threshold) {
      const displayName = cat === 'best-practices' ? 'Best Practices' : cat.charAt(0).toUpperCase() + cat.slice(1)
      failures.push(`${displayName} ${score}`)
    }
  }

  results.push({
    label,
    url: run.url,
    scores,
    status: failures.length === 0 ? 'pass' : 'fail',
    failures,
  })
}

// Print score table
const colW = { label: 24, perf: 6, a11y: 6, best: 6, seo: 5, pwa: 5, status: 20 }
const header =
  'URL'.padEnd(colW.label) +
  'Perf'.padEnd(colW.perf) +
  'A11y'.padEnd(colW.a11y) +
  'Best'.padEnd(colW.best) +
  'SEO'.padEnd(colW.seo) +
  'PWA'.padEnd(colW.pwa) +
  'Status'

console.log('\nLighthouse Score Report')
console.log('─'.repeat(header.length))
console.log(header)
console.log('─'.repeat(header.length))

for (const r of results) {
  const labelCol = r.label.padEnd(colW.label)
  const perfCol = String(r.scores.performance).padEnd(colW.perf)
  const a11yCol = String(r.scores.accessibility).padEnd(colW.a11y)
  const bestCol = String(r.scores['best-practices']).padEnd(colW.best)
  const seoCol = String(r.scores.seo).padEnd(colW.seo)
  const pwaCol = String(r.scores.pwa).padEnd(colW.pwa)
  const statusCol = r.status === 'pass' ? '✓ PASS' : `✗ FAIL (${r.failures.join(', ')})`

  console.log(`${labelCol}${perfCol}${a11yCol}${bestCol}${seoCol}${pwaCol}${statusCol}`)
}

console.log('─'.repeat(header.length))

const failing = results.filter((r) => r.status === 'fail')

if (failing.length === 0) {
  console.log(`\n✓ All apps pass (score ≥ ${threshold})\n`)
  process.exit(0)
} else {
  console.log(`\n✗ ${failing.length} URL(s) below threshold (${threshold}):`)
  for (const r of failing) {
    console.log(`  ${r.label}: ${r.failures.join(', ')}`)
  }
  console.log()
  process.exit(1)
}
