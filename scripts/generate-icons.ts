import sharp from 'sharp'
import path from 'path'
import fs from 'fs-extra'

const args = process.argv.slice(2)
const getArg = (name: string) => {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 ? args[idx + 1] : null
}

const inputPath = getArg('input')
const appId = getArg('app')

if (!inputPath || !appId) {
  console.error('Usage: pnpm generate-icons --input <path-to-1024px.png> --app <app-id>')
  process.exit(1)
}

const publicDir = path.resolve(process.cwd(), 'public')
fs.ensureDirSync(publicDir)

async function generateIcons() {
  const input = path.resolve(inputPath!)

  console.log(`Generating icons for "${appId}" from ${input}...`)

  // 192x192
  await sharp(input)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, `${appId}-icon-192.png`))
  console.log(`  ✓ ${appId}-icon-192.png`)

  // 512x512
  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, `${appId}-icon-512.png`))
  console.log(`  ✓ ${appId}-icon-512.png`)

  // Maskable 512x512 (80% icon, 10% padding each side)
  const paddedSize = 512
  const iconSize = Math.floor(paddedSize * 0.8)
  const padding = Math.floor((paddedSize - iconSize) / 2)

  const iconBuffer = await sharp(input).resize(iconSize, iconSize).png().toBuffer()

  await sharp({
    create: {
      width: paddedSize,
      height: paddedSize,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // zinc-950
    },
  })
    .composite([{ input: iconBuffer, top: padding, left: padding }])
    .png()
    .toFile(path.join(publicDir, `${appId}-icon-maskable.png`))
  console.log(`  ✓ ${appId}-icon-maskable.png`)

  console.log('\nDone! Icons saved to public/')
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
