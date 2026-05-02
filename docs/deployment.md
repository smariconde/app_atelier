# Deployment

AppAtelier deploys as a single Vercel project. One project, one deploy, all apps.

---

## The single-project model

All apps are routes inside one Next.js application. There are no per-app Vercel projects — creating one would break subdomain routing and violate a core constraint. Every time you add a new app, you redeploy the same project.

---

## Deploy to production

The easiest way is through the AI skill:

```
/deploy-app
```

This runs `qa-auditor` first (Lighthouse + manifest checks), shows you the results, and only runs the deploy after you approve. It blocks if any Lighthouse score is below 90.

To deploy manually:

```bash
vercel --prod
```

Or trigger a deploy by pushing to your main branch if Vercel is connected to your Git repository.

---

## DNS setup

You need two DNS records pointing to Vercel:

| Type | Name | Value |
|---|---|---|
| `A` | `@` (apex) | `76.76.21.21` (Vercel's IP) |
| `CNAME` | `*` (wildcard) | `cname.vercel-dns.com` |

The `A` record routes `yourdomain.com` → the hub. The wildcard `CNAME` routes `*.yourdomain.com` → the same Vercel project, which the middleware then routes to the correct app by subdomain.

DNS changes can take up to 48 hours to propagate, though it's usually much faster.

---

## Vercel project setup

1. Import your repository in the Vercel dashboard. Select **Next.js** as the framework.
2. Go to **Settings → Domains** and add both:
   - `yourdomain.com`
   - `*.yourdomain.com`
3. Vercel will provision a TLS certificate covering both domains automatically.
4. Add all required environment variables in **Settings → Environment Variables** (see below).

Vercel config is in `vercel.json` at the repo root — it is already set up for a single Next.js project and does not need changes.

---

## Environment variables for production

| Variable | Required | Description |
|---|---|---|
| `DB_ADAPTER` | yes | `turso`, `postgres`, `mysql`, or `d1`. Not `sqlite` (serverless filesystem is ephemeral). |
| `DATABASE_URL` | yes | Connection string for your chosen adapter. |
| `DATABASE_AUTH_TOKEN` | if Turso | Turso auth token. |
| `AUTH_SECRET` | yes | Secret for Better Auth session cookies. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | yes | Your production URL: `https://yourdomain.com`. |
| `ANTHROPIC_API_KEY` | if AI used | Required for any app with MCP or AI features. |
| `GOOGLE_MCP_URL` | if gmail/calendar/drive | Google Workspace MCP endpoint. |
| `GOOGLE_MCP_TOKEN` | if gmail/calendar/drive | Google OAuth token. |
| `NOTION_MCP_TOKEN` | if notion | Notion internal integration token. |

Set these in the Vercel dashboard. Never commit secrets to `.env` files tracked by git.

---

## Adding a new app after initial deploy

No special steps. After you scaffold and implement a new app locally:

1. Commit the changes
2. Push to your main branch (or run `vercel --prod`)
3. Vercel rebuilds and redeploys the entire project

The new app's subdomain works immediately after the deploy completes because Vercel already has the wildcard domain configured.

---

## Self-hosted alternative

If you prefer to self-host instead of using Vercel, you need a setup that supports wildcard subdomains. Docker + Caddy is the most straightforward option:

**Caddy** handles TLS and reverse-proxies all subdomains to the Next.js server:

```
# Caddyfile
yourdomain.com, *.yourdomain.com {
  reverse_proxy localhost:3000
}
```

**Docker** runs the production build:

```bash
pnpm build
node .next/standalone/server.js  # or use the official Next.js Docker image
```

Notes for self-hosting:
- Use Turso, Postgres, or MySQL as the database adapter — SQLite is fine for self-hosted single-server but has no replication
- Make sure your server's firewall allows ports 80 and 443
- Caddy provisions TLS certificates from Let's Encrypt automatically (requires a public domain)
- Set `HOSTNAME=0.0.0.0` in the environment so Next.js listens on all interfaces

The middleware and subdomain routing logic is identical in self-hosted and Vercel deployments — it runs in Node.js, not in Vercel edge infrastructure.
