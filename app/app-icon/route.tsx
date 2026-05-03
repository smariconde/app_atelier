import { ImageResponse } from 'next/og'
import { registry } from '../manifest'
import { getLucideElement } from '../_lib/lucide-svg'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const appId = url.searchParams.get('app') ?? 'hub'
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') ?? '192'), 16), 1024)
  const isMaskable = url.searchParams.get('purpose') === 'maskable'

  const app = registry[appId] ?? registry.hub

  // For maskable: icon at 80% with zinc-950 background padding
  const containerSize = isMaskable ? Math.round(size * 0.8) : size
  const iconPixels = Math.round(containerSize * 0.55)

  const iconEl = getLucideElement(app.icon, 'white', iconPixels, 1.5)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isMaskable ? '#09090B' : 'transparent',
        }}
      >
        <div
          style={{
            width: containerSize,
            height: containerSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: app.color,
            borderRadius: '22%',
          }}
        >
          {iconEl}
        </div>
      </div>
    ),
    { width: size, height: size },
  )
}
