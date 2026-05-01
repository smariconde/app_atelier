# apps/hub/

Hub manifest workspace package. The hub is the launcher — an icon grid, nothing else.

## Rules

- The hub never appears in its own icon grid (it's the launcher, not an app)
- No widgets, no dashboards, no notifications — just icons that link to subdomains
- Hub lives at the **root domain** (`yourdomain.com`), never at `hub.yourdomain.com`

## Adding an app to the hub

Edit `app/apps/hub/page.tsx`:

```typescript
// 1. Add import
import financeApp from '../../../apps/finance/manifest'

// 2. Add to apps array
const apps: AppManifest[] = [notesApp, financeApp]
```

Also add to `app/manifest.ts` registry for PWA manifest routing.

## Icon rendering

Icons are resolved by Lucide icon name (kebab-case from manifest `icon` field). The hub page converts `notebook-pen` → `NotebookPen` and renders the Lucide component. If the icon name doesn't exist in Lucide, it falls back to the first letter of the app name.
