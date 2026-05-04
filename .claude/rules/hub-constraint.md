# Rule — Hub and platform constraints

These constraints are architectural invariants. Breaking them risks deploy failures, routing bugs, or data corruption.

## Single Vercel project

All apps deploy as one Next.js project to one Vercel project. Never create per-app Vercel projects, never run `vercel link` for individual app directories.

## Subdomains only — no path routing

Every app gets its own subdomain (`notes.yourdomain.com`). Path-based routing (`yourdomain.com/notes`) is wrong and conflicts with middleware.

`yourdomain.com` → hub  
`hub.yourdomain.com` → wrong (hub is at the root domain)

## Hub is a launcher

`app/apps/hub/page.tsx` is an icon grid only. No widgets, no dashboard, no app-specific UI. Never add content to the hub beyond the app grid.

## Registry — two files must stay in sync

Adding or removing an app requires updating both:

1. `app/manifest.ts` — import + `registry` object entry  
2. `app/apps/hub/page.tsx` — import + `apps` array entry

Running `pnpm doctor` will flag any mismatch. Running `pnpm doctor --fix` will auto-repair.

Both files are edited by `scripts/new-app.ts`, `scripts/delete-app.ts`, and `scripts/doctor.ts` — all three use the same `scripts/lib/hub-registry.ts` helper. If you change the registry shape, update that one file.

## Protected directories

Never modify:
- `apps/_template/` — scaffold source (only `pnpm new-app` uses it)
- `apps/hub/` (workspace package for hub)
- `app/apps/hub/layout.tsx` or `app/layout.tsx` — platform-level layouts

## Cross-app links

Never hardcode `localhost:3000` in cross-app links. Use:

```typescript
process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'
```

Subdomains in dev: `notes.localhost:3000`. In production: `notes.yourdomain.com`.

## Single user

No multi-tenancy, no admin panels, no billing, no user management UI. Auth (`@hub/auth`) exists but is not enforced on any current app.
