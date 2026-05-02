export interface AppManifest {
  id: string
  subdomain: string
  name: string
  description?: string
  version?: string
  icon: string          // Lucide icon name
  color: string         // hex
  enabled: boolean
  status: 'stable' | 'beta' | 'experimental'
  pwa: {
    themeColor: string
    backgroundColor: string
    display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
    orientation?: 'portrait' | 'landscape' | 'any'
    icons: Array<{
      src: string
      sizes: string
      type?: string
      purpose?: 'any' | 'maskable' | 'monochrome'
    }>
  }
  database?: {
    schemaPath: string
    tablePrefix: string   // REQUIRED - e.g. 'notes_'
    migrations?: string
  }
  aiContext?: {
    description: string
    domain: string
    examples: string[]
  }
  mcpServers?: string[]  // Known IDs: 'gmail', 'google-calendar', 'notion', 'drive'
}

export function defineManifest(manifest: AppManifest): AppManifest {
  return manifest
}
