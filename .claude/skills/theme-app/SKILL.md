---
name: theme-app
description: "TRIGGER when user wants to change the look, feel, color, icon, or visual identity of an existing app. Changes brand color, CSS palette, icon, and typography. SKIP for code or feature changes — use /modify-app instead."
argument-hint: "<appId> [theme description]"
user-invocable: true
allowed-tools: Read, Glob, Agent
agent: design-lead
---

## Agents used

- `design-lead` — produces a theme brief with color, icon, typography decisions
- `ui-designer` — implements CSS variable overrides and manifest update
- `pwa-specialist` — validates manifest colors and icon after changes

---

## Overview

```
[theme intent] → design-lead → theme brief
                                    ↓ GATE 1: user approves theme
               ui-designer → applies CSS variable overrides + updates manifest
               pwa-specialist → validates PWA manifest colors
                                    ↓ GATE 2: user confirms
```

---

## Phase 1 — Theme Design

**Agent**: `design-lead`

1. Extract the `appId` from the command. If no theme description was provided, use AskUserQuestion:

   > "How do you want `<appId>` to feel?"
   > - Calm & focused (muted blues, generous whitespace)
   > - Bold & energetic (vivid accent, strong contrast)
   > - Nature-inspired (greens, earthy tones)
   > - Minimal (near-neutral, typography-forward)
   > - Other — I'll describe it

   If "Other", ask the user to type their description before proceeding.

2. Invoke the `design-lead` agent with:
   - The appId
   - The theme description
   - This context: "Read `apps/<appId>/manifest.ts` and `.claude/specs/<appId>.md` to understand the app, then produce a theme brief."

3. Show the full theme brief output to the user.

---

## Gate 1: Theme Review

Wait for the user to say "approve theme", "looks good", "proceed", or similar confirmation.

If they want adjustments ("warmer", "different icon", "more minimal", etc.), re-invoke design-lead:
> "User wants to adjust: [feedback]. You previously produced: [paste existing brief]. Please revise."

Do not implement until the theme is explicitly approved.

---

## Phase 2 — Theme Implementation

**Agent**: `ui-designer`

Invoke the `ui-designer` agent with:
- The appId
- The full approved theme brief (paste the exact text)
- This instruction: "Implement this theme brief for `apps/<appId>/`. Update layout.tsx and manifest.ts only."

No gate — file changes are small and reversible with `git restore`.

---

## Phase 3 — PWA Validation

**Agent**: `pwa-specialist`

Invoke the `pwa-specialist` agent with the appId. It will:
- Run `pnpm doctor`
- Verify manifest themeColor is a valid hex and matches the new brand color
- Confirm the icon name is a valid Lucide icon

Show its report.

---

## Gate 2: Done

Print the completion summary:

```
✓ <AppName> themed.

  App URL:  http://<appId>.localhost:3000

Theme applied:
  Brand color: <hex>
  Icon:        <lucide-icon-name>

What changed:
  - app/apps/<appId>/layout.tsx  (CSS variable overrides)
  - apps/<appId>/manifest.ts     (icon, color, themeColor)

Next steps:
  1. Refresh http://<appId>.localhost:3000 to see the new theme
  2. If you want a custom app icon image:
       pnpm generate-icons --app <appId> --input <your-1024px.png>

How to revert:
  git restore app/apps/<appId>/layout.tsx apps/<appId>/manifest.ts
```

---

## Constraints

- **Only** `layout.tsx` and `apps/<appId>/manifest.ts` are modified
- **Never** touch `page.tsx`, `actions.ts`, schema, hub, or other apps
- **Icon** must be from the approved Lucide set
- **Colors** must maintain legibility against the zinc-950 dark background
- **No external fonts** — system font stack only
- **No client-side theme switching** — the style tag in layout.tsx is the mechanism
