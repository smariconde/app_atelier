import type { MetadataRoute } from 'next'
import type { AppManifest } from '@hub/core'

export function buildPWAManifest(app: AppManifest): MetadataRoute.Manifest {
  const icons: MetadataRoute.Manifest['icons'] = app.pwa.icons?.length
    ? app.pwa.icons
    : [
        { src: `/app-icon?app=${app.id}&size=192`, sizes: '192x192', type: 'image/png' },
        { src: `/app-icon?app=${app.id}&size=512`, sizes: '512x512', type: 'image/png' },
        {
          src: `/app-icon?app=${app.id}&size=512&purpose=maskable`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ]

  return {
    name: app.name,
    short_name: app.name,
    description: app.description,
    start_url: '/',
    display: app.pwa.display,
    background_color: app.pwa.backgroundColor,
    theme_color: app.pwa.themeColor,
    orientation: app.pwa.orientation as MetadataRoute.Manifest['orientation'],
    icons,
  }
}
