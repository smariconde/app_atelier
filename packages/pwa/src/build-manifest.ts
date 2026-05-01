import type { MetadataRoute } from 'next'
import type { AppManifest } from '@hub/core'

export function buildPWAManifest(app: AppManifest): MetadataRoute.Manifest {
  return {
    name: app.name,
    short_name: app.name,
    description: app.description,
    start_url: '/',
    display: app.pwa.display,
    background_color: app.pwa.backgroundColor,
    theme_color: app.pwa.themeColor,
    orientation: app.pwa.orientation as MetadataRoute.Manifest['orientation'],
    icons: app.pwa.icons,
  }
}
