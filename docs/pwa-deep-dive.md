# PWA Deep Dive

Each AppAtelier app is a full Progressive Web App — installable, offline-capable, and independent from every other app.

---

## Why subdomains?

Each app at its own subdomain (`notes.yourdomain.com`) is its own **origin** in the browser's security model. That means:

- **Own service worker** — `notes.yourdomain.com/sw.js` is scoped to the notes origin only. Installing or updating the Notes SW never touches the Tasks SW.
- **Own storage** — IndexedDB, Cache Storage, and localStorage are partitioned per origin. Apps cannot accidentally read each other's data.
- **Own install prompt** — the browser tracks install state per origin. Notes and Tasks appear as separate icons on the home screen.
- **Own PWA manifest** — `notes.yourdomain.com/manifest.webmanifest` contains only Notes metadata. The hub at `yourdomain.com` has its own manifest.

Path-based routing (`yourdomain.com/notes`) would put all apps on the same origin and collapse all of these guarantees. That is why AppAtelier uses subdomains and never path-based routing.

---

## buildPWAManifest

`@hub/pwa` exports `buildPWAManifest` which converts an `AppManifest` to a `MetadataRoute.Manifest` for Next.js:

```typescript
// app/apps/notes/manifest.ts (Next.js route, not the workspace package)
import { buildPWAManifest } from '@hub/pwa'
import notesApp from '../../../../apps/notes/manifest'

export default function manifest() {
  return buildPWAManifest(notesApp)
}
```

The dynamic version at `app/manifest.ts` reads the `Host` header and looks up the right app manifest from a registry, so `notes.yourdomain.com/manifest.webmanifest` returns Notes data and `tasks.yourdomain.com/manifest.webmanifest` returns Tasks data.

Fields mapped from `AppManifest`:

| Manifest field | Source |
|---|---|
| `name` / `short_name` | `app.name` |
| `description` | `app.description` |
| `theme_color` | `app.pwa.themeColor` |
| `background_color` | `app.pwa.backgroundColor` |
| `display` | `app.pwa.display` |
| `orientation` | `app.pwa.orientation` |
| `icons` | `app.pwa.icons` (passed through as-is) |
| `start_url` | always `'/'` |

---

## Service worker (Serwist)

The service worker source is at `app/sw.ts`. Serwist compiles it to `public/sw.js` during `pnpm build`.

**Dev mode**: SW is disabled. `next.config.ts` passes `disable: process.env.NODE_ENV === 'development'` to Serwist. This prevents stale cache issues during development.

**Production**: SW is active after `pnpm build && pnpm start` (or after a Vercel deploy). It pre-caches Next.js static assets and enables offline support.

To add custom caching strategies, edit `app/sw.ts` directly. See the [Serwist docs](https://serwist.pages.dev/) for the runtime caching API.

---

## InstallPrompt component

`@hub/pwa` exports `<InstallPrompt />`, a client component that handles both install paths:

```typescript
// In app/apps/<name>/layout.tsx
import { InstallPrompt } from '@hub/pwa'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  )
}
```

**Chrome / Android**: Listens for the `beforeinstallprompt` event. Shows a "Install app" button that triggers the native browser install prompt.

**iOS Safari**: Detects the Safari user agent on iOS. Shows a modal with manual instructions: tap the Share icon, then "Add to Home Screen".

**Already installed**: If the app is running in `standalone` display mode (i.e., already installed), `InstallPrompt` renders nothing.

`pnpm doctor` checks that `<InstallPrompt />` is present in each app's layout and warns if it's missing.

---

## Generating icons

PWA icons must be provided as separate PNG files in `public/`. Generate them from a single 1024×1024 source image:

```bash
pnpm generate-icons --input ./my-logo.png --app notes
```

Output:

| File | Size | Purpose |
|---|---|---|
| `public/notes-icon-192.png` | 192×192 | Standard icon |
| `public/notes-icon-512.png` | 512×512 | Standard icon (high-res) |
| `public/notes-icon-maskable.png` | 512×512 | Maskable — icon at 80% with padding, zinc-950 background |

The maskable icon is required for Android adaptive icons. Without it, Android clips the icon in a circle and the result looks wrong.

After generating, verify the paths in `apps/<name>/manifest.ts` match the generated filenames.

---

## Lighthouse thresholds

`pnpm audit --url <https://yourdomain.com>` runs Lighthouse CI against all app subdomains. Thresholds are defined in `lighthouserc.js`:

| Category | Minimum (deploy gate) | Target (v1.0) |
|---|---|---|
| Performance | 90 | 95 |
| Accessibility | 90 | 95 |
| Best Practices | 90 | 95 |
| SEO | 90 | 95 |
| PWA | 90 | 95 |

The `/deploy-app` skill invokes `qa-auditor`, which runs `pnpm audit` and blocks the deploy if any score is below 90. A score below 95 in any category is noted in the audit report but does not block the deploy.

Run audit locally after a production build:

```bash
pnpm build
pnpm audit --url http://localhost:3000
```

---

## pnpm doctor PWA checks

`pnpm doctor` validates PWA config for every registered app:

- `manifest.ts` has required fields (`id`, `subdomain`, `name`, `icon`, `color`, `pwa.*`)
- `pwa.icons` array is non-empty
- Icon files listed in `pwa.icons` exist in `public/`
- At least one maskable icon is declared
- `<InstallPrompt />` is present in `app/apps/<id>/layout.tsx`
- App is wired in both `app/manifest.ts` and `app/apps/hub/page.tsx`

Doctor exits with a non-zero code if any check fails. The PreToolUse hook runs doctor before every `git commit` and blocks the commit on failure.
