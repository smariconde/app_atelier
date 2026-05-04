---
name: pwa-audit
description: "Validates all AppAtelier apps for PWA compliance and Lighthouse scores. Without a URL, runs static checks only. With --url, runs full Lighthouse audit against all app subdomains."
argument-hint: "[--url <baseUrl>]"
user-invocable: true
allowed-tools: Read, Bash
agent: qa-auditor
---

## Agents used

- `qa-auditor` — runs `pnpm doctor`, manifest validation, and optionally Lighthouse

---

## Overview

```
[static checks always] → pnpm doctor + manifest validation
         [if --url]    → Lighthouse per-app subdomain audit
                              → score table (threshold: ≥ 90)
```

---

## Phase 1 — Determine audit mode

Extract the `--url` argument from the command if present (e.g. `--url https://yourdomain.com`).

If no `--url` was provided and the intent is ambiguous, use AskUserQuestion to clarify:

> "Which audit mode would you like to run?"
> - Static checks only (pnpm doctor + manifest validation)
> - Full Lighthouse audit (requires a live URL)

If the user selects "Full Lighthouse audit", ask for the base URL before invoking the agent.

---

## Phase 2 — Invoke `qa-auditor`

**Without URL** — static checks only:
> "Run the static audit for all apps. No URL provided — skip Lighthouse and run pnpm doctor + manifest validation only."

**With URL** — full audit:
> "Run the full audit including Lighthouse. URL: https://yourdomain.com"

Show the agent's full output.

---

## Phase 3 — Summary

**If no URL (static only):**
```
Static Audit Complete

Run a full Lighthouse audit after deploying your app:
  /pwa-audit --url https://yourdomain.com

Or deploy first with:
  /deploy-app
```

**If full audit passed:**
```
✓ All apps pass QA. Production is clean.
```

**If any app failed:**

Print which apps failed and recommended fixes:

| Category | Common fixes |
|---|---|
| Performance | Add `next/image` for images, reduce JS bundle, add caching headers |
| Accessibility | Add ARIA labels, fix color contrast, ensure keyboard nav |
| Best Practices | Fix mixed content, use HTTPS-only resources |
| SEO | Add meta descriptions, canonical URLs |
| PWA | Run `pnpm generate-icons --app <id>`, verify service worker |

Then prompt:
> "Fix the issues above and run `/pwa-audit --url <url>` again, or run `/modify-app <appId>` to address specific issues."

---

## Constraints

- Never modify any code to fix audit failures — report only
- If no URL is provided, never attempt to start a local server
- The qa-auditor handles Chrome launching via @lhci/cli automatically
