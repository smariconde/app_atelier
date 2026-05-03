import { ImageResponse } from 'next/og'
import { registry } from '../manifest'

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const appId = url.searchParams.get('app') ?? 'hub'
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') ?? '192'), 16), 1024)
  const isMaskable = url.searchParams.get('purpose') === 'maskable'

  const app = registry[appId] ?? registry.hub

  const iconName = toPascalCase(app.icon)
  const lucide = await import('lucide-react')
  const IconComponent = (lucide as Record<string, unknown>)[iconName] as
    | React.FC<{ color: string; size: number; strokeWidth: number }>
    | undefined

  // For maskable: icon at 80% with zinc-950 background padding
  const containerSize = isMaskable ? Math.round(size * 0.8) : size
  const iconPixels = Math.round(containerSize * 0.55)

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
          {IconComponent && <IconComponent color="white" size={iconPixels} strokeWidth={1.5} />}
        </div>
      </div>
    ),
    { width: size, height: size },
  )
}
