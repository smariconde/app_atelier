# @hub/auth

Better Auth with cross-subdomain SSO. Auth infrastructure is wired (v0.1) but UI remains unenforced. Login pages are not on the current roadmap.

## How SSO works

Cookies are scoped to `Domain=.yourdomain.com` (set via `COOKIE_DOMAIN` env var). A session created at `yourdomain.com` is automatically sent to `notes.yourdomain.com`, `fitness.yourdomain.com`, etc.

In local dev, `COOKIE_DOMAIN=localhost` covers `localhost` and `*.localhost`.

## Session type

```typescript
import { auth } from '@hub/auth'
import type { Session } from '@hub/auth'
```

## Route handler (when adding auth UI in v0.3)

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from '@hub/auth'
import { toNextJsHandler } from 'better-auth/next-js'
export const { GET, POST } = toNextJsHandler(auth)
```

## Env vars

```
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:3000       # or https://yourdomain.com in prod
COOKIE_DOMAIN=localhost                    # or .yourdomain.com in prod
```
