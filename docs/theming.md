# Theming

AppAtelier uses CSS custom properties for theming. Dark mode is the default. Each app can declare its own brand color in its manifest.

---

## Global CSS variables

All base tokens live in `app/globals.css`. They follow the shadcn/ui convention — HSL channels without the `hsl()` wrapper so they can be composed in Tailwind:

```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --radius: 0.5rem;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

Dark mode is applied via the `dark` class on `<html>`. `@hub/ui` defaults to dark mode — new apps scaffold with `className="dark"` on the root element.

---

## Per-app brand color

Two manifest fields control per-app color:

| Field | Where it appears |
|---|---|
| `color` (hex) | Icon background in the hub launcher |
| `pwa.themeColor` (hex) | Browser chrome color when installed as PWA; also used as the accent in the install prompt |

These are typically the same value. Example from the Notes app:

```typescript
color: '#F59E0B',
pwa: {
  themeColor: '#F59E0B',
  // ...
}
```

To use the theme color as a CSS variable inside your app layout, set it explicitly in `layout.tsx`:

```typescript
export default function Layout({ children }) {
  return (
    <html lang="en" className="dark" style={{ '--brand': '#F59E0B' } as React.CSSProperties}>
      <body>{children}</body>
    </html>
  )
}
```

Then reference `var(--brand)` in your CSS or Tailwind arbitrary values.

---

## The /theme-app skill

`/theme-app <appId> [brief]` runs a two-agent workflow to change an app's visual identity:

```
[theme brief] → design-lead → theme brief document
                                    ↓ GATE: you approve the brief
               ui-designer → CSS variable overrides applied
```

### What design-lead decides (Opus)

- **Brand color** — primary hex, expressed as an HSL triplet for the CSS variable system
- **Full HSL palette** — derived shades for background, card, border, muted, accent
- **Lucide icon** — updated if the brief requests it
- **Typography weight** — default (`font-normal`) or heavier (`font-medium`) for the app's primary content

Design-lead writes a structured theme brief document and stops at an approval gate.

### What ui-designer applies

After you approve the brief, ui-designer:

1. Adds CSS variable overrides to `app/apps/<appId>/layout.tsx` (scoped to that layout, not globals)
2. Updates `manifest.color` and `pwa.themeColor` in `apps/<appId>/manifest.ts`
3. Runs `pnpm doctor` to verify the manifest is still valid
4. Prints a summary of what changed

Variable overrides are applied inline on the `<html>` element or in a `<style>` tag inside the layout — they don't modify `app/globals.css` so other apps are unaffected.

---

## Manual theming

If you prefer to theme by hand rather than using the skill:

1. Open `app/apps/<name>/layout.tsx`
2. Add a `<style>` block or inline style that overrides the CSS variables for your palette:

```typescript
export default function Layout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          .dark {
            --primary: 38 92% 50%;           /* amber */
            --primary-foreground: 0 0% 100%;
            --background: 20 14% 4%;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

3. Update `apps/<name>/manifest.ts` to set `color` and `pwa.themeColor` to match.
4. Run `pnpm doctor` to verify.

Keep overrides scoped to your layout. Modifying `app/globals.css` changes every app.
