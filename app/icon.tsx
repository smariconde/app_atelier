import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { resolveApp } from './manifest'
import { getLucideElement } from './_lib/lucide-svg'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const h = await headers()
  const host = h.get('host') ?? ''
  const app = resolveApp(host)

  // If the app has a static brand PNG, serve it directly
  if (app.pwa.icons?.length) {
    const staticFile = path.join(process.cwd(), 'public', `${app.id}-icon-192.png`)
    if (fs.existsSync(staticFile)) {
      return new Response(fs.readFileSync(staticFile), { headers: { 'Content-Type': 'image/png' } })
    }
  }

  const iconEl = getLucideElement(app.icon, 'white', 18)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: app.color,
          borderRadius: '22%',
        }}
      >
        {iconEl}
      </div>
    ),
    { ...size },
  )
}
