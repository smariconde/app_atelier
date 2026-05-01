# @hub/pwa

PWA manifest builder and install prompt component.

## buildPWAManifest

Takes an `AppManifest` and returns a `MetadataRoute.Manifest` for Next.js:

```typescript
// app/manifest.ts
import { buildPWAManifest } from '@hub/pwa'
import notesApp from '../apps/notes/manifest'

export default async function manifest() {
  return buildPWAManifest(notesApp)
}
```

The dynamic version in `app/manifest.ts` reads the `Host` header to select the right app from the registry.

## InstallPrompt

Client component — handles both install paths:
- **Chrome/Android**: listens for `beforeinstallprompt`, shows a button that triggers native prompt
- **iOS Safari**: detects UA, shows a modal with manual "Share → Add to Home Screen" steps

```typescript
// In any layout.tsx
import { InstallPrompt } from '@hub/pwa'
// ...
<InstallPrompt />
```

## Service worker (Serwist)

- **Dev**: SW is disabled (`disable: process.env.NODE_ENV === 'development'` in `next.config.ts`)
- **Production**: Serwist compiles `app/sw.ts` → `public/sw.js` during `pnpm build`
- The SW source is at `app/sw.ts` — edit it to add custom caching strategies

## Icons

Generate with `pnpm generate-icons --input <1024px.png> --app <id>`. Output goes to `public/`:
- `<id>-icon-192.png`
- `<id>-icon-512.png`
- `<id>-icon-maskable.png` (80% icon + padding on zinc-950 background)
