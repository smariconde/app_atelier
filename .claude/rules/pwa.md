# Rule — PWA configuration

Each app is a standalone PWA installed at its subdomain. The PWA contract lives inside the app's manifest and the `app/apps/<appId>/layout.tsx`.

## Required manifest.pwa fields

```typescript
pwa: {
  themeColor: '<same hex as color field>',
  backgroundColor: '#09090B',  // always dark
  display: 'standalone',
  icons: [
    { src: '/<appId>-icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/<appId>-icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/<appId>-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
},
```

## Icon files

Icons live in `public/`. They are **not** committed by the scaffold — they must be generated:

```bash
pnpm generate-icons --input <1024px.png> --app <appId>
```

This creates `public/<appId>-icon-192.png`, `public/<appId>-icon-512.png`, `public/<appId>-icon-maskable.png`.

Do NOT run `pnpm generate-icons` yourself — it requires a user-provided source image. If icons are missing, report the command above and stop.

## InstallPrompt in layout

Every `app/apps/<appId>/layout.tsx` must include:

```typescript
import { InstallPrompt } from '@hub/pwa'
// ...
<InstallPrompt />  // inside the returned JSX
```

This is required for the browser install prompt to appear. Auto-fix with Edit if missing.

## Icon generation vs theme change

- Changing `color` in manifest.ts does NOT regenerate icons automatically.
- After a theme change that alters `color`, the user must re-run `pnpm generate-icons` or the hub icon color will be stale. Always warn.

## Service workers

Service workers are only enabled in production builds (`pnpm build`). They are skipped in `pnpm dev`. Don't test SW behavior in dev.
