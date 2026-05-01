// PostToolUse hook — prints reminder when manifest.ts is edited and pwa.icons may have changed
const raw = process.env.CLAUDE_TOOL_INPUT || ''
if (!raw) process.exit(0)

let data
try {
  data = JSON.parse(raw)
} catch {
  process.exit(0)
}

const filePath = String(data.file_path || '')
if (!filePath.includes('manifest.ts')) process.exit(0)

// Only fire for app manifests (apps/<id>/manifest.ts), not the Next.js route manifest
const parts = filePath.replace(/\\/g, '/').split('/')
const appsIdx = parts.lastIndexOf('apps')
if (appsIdx < 0) process.exit(0)

const appId = parts[appsIdx + 1]
if (!appId || appId === 'hub') process.exit(0)

const changed = String(data.new_string || data.content || '')
if (changed.includes('icons') || changed.includes('pwa')) {
  process.stdout.write(
    `\n[manifest-sync] ${appId}/manifest.ts changed.\n` +
      `  If pwa.icons were modified, regenerate:\n` +
      `  pnpm generate-icons --app ${appId} --input <1024px.png>\n\n`,
  )
}
