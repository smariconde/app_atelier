// PreToolUse hook — blocks git commits if pnpm doctor fails
const { execSync } = require('child_process')

const raw = process.env.CLAUDE_TOOL_INPUT || ''
if (!raw) process.exit(0)

let data
try {
  data = JSON.parse(raw)
} catch {
  process.exit(0)
}

const cmd = String(data.command || '')
if (!cmd.includes('git commit')) process.exit(0)

try {
  execSync('node node_modules/tsx/dist/cli.mjs scripts/doctor.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
  process.exit(0)
} catch {
  process.exit(2)
}
