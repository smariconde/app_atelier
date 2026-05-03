# /deploy-app skill

**Trigger**: `/deploy-app`

**Description**: TRIGGER when user says "deploy", "ship", "push to production", or asks to go live. SKIP for audit-only requests — use `/pwa-audit` instead. SKIP for per-app deploys — there are none; this always deploys the entire platform. Requires explicit approval before going live.

---

## Overview

Two gates protect production:

```
pnpm doctor + pnpm build → GATE 1: user confirms deploy
deployer → vercel --prod → production URL + DNS instructions
```

---

## Phase 1 — Preflight checks

**Agent**: `deployer` (mode: `deploy:prod` preflight only)

Invoke the deployer agent:
> "Run preflight checks only: verify vercel CLI is installed, check project linking, run pnpm doctor, and run pnpm build. Do NOT deploy yet — stop after the build succeeds and report status."

If preflight passes, show the result and continue.

If preflight fails (doctor errors, build errors, missing vercel CLI), show the failure and stop:
```
✗ Preflight failed. Fix the issues above before deploying.

Common fixes:
  - Doctor errors   → run /pwa-audit to diagnose and /modify-app to fix
  - Build errors    → check TypeScript errors with pnpm typecheck
  - Missing vercel  → npm install -g vercel && vercel login
```

Do not proceed to Gate 1 until preflight passes.

---

## Gate 1: Deploy confirmation

Once preflight passes, print exactly:

```
Preflight passed. Ready to deploy to production.

This will run: vercel --prod

The deployment will be live immediately at your Vercel URL.
After deployment, you'll receive DNS instructions to configure
your custom domain with wildcard subdomains.

Reply "deploy" to proceed, or ask questions first.
```

Wait for the user to say "deploy", "yes", "proceed", or similar explicit confirmation.

Do not deploy until confirmed.

---

## Phase 2 — Production deploy

**Agent**: `deployer` (mode: `deploy:prod`)

Invoke the deployer agent:
> "Run a production deploy: vercel --prod. Run the full flow (preflight is already done but re-run doctor to be safe, skip the build since we just built). After success, print the production URL and full DNS instructions."

Show the agent's complete output, including the production URL and DNS instructions.

---

## Phase 3 — Done

Print the completion summary:

```
✓ Deployed to production!

Next steps:
  1. Open your Vercel dashboard to confirm the deployment
  2. Follow the DNS instructions above to configure your domain
  3. After DNS propagates (5–30 min), verify PWA scores:
       /pwa-audit --url https://yourdomain.com

To redeploy after changes:
  /deploy-app
```

---

## Constraints enforced throughout

- **One project only** — never deploy individual apps to separate Vercel projects
- **Never skip preflight** — doctor and build must pass before any deploy
- **Never auto-confirm** — Gate 1 requires explicit user approval
- **DNS instructions always** — always print the wildcard domain setup guide after production deploy
- **Vercel is global CLI** — never add vercel as a project dependency
