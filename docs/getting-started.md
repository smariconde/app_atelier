# Getting Started

Get AppAtelier running locally in about five minutes.

---

## Prerequisites

- **Node.js 20+** — `node --version` should print `v20.x` or higher
- **pnpm** — `npm install -g pnpm` if not installed
- **Claude Code** — required for AI Studio skills (`/create-app`, `/modify-app`, etc.)

---

## 1. Clone and install

```bash
git clone https://github.com/yourname/app_atelier.git
cd app_atelier
pnpm install
```

---

## 2. Configure environment variables

Copy the example file and fill in the required values:

```bash
cp .env.example .env
```

Minimum required for local dev:

```env
# Database (SQLite default — no external service needed)
DB_ADAPTER=sqlite
DATABASE_URL=./local.db

# Better Auth secret (generate a random string)
BETTER_AUTH_SECRET=your-random-secret-here

# Required only for AI features (MCP apps like Daily Briefing)
ANTHROPIC_API_KEY=sk-ant-...
```

For MCP integrations (Gmail, Notion, etc.) see [docs/mcp.md](./mcp.md).

---

## 3. Create the database

```bash
pnpm db:setup
```

This creates `local.db` and pushes all table schemas from every app's `db/schema.ts`. It is idempotent — safe to run again after adding a new app.

---

## 4. Start the dev server

```bash
pnpm dev
```

The dev server starts on port 3000. Two URLs are now live:

| URL | What you see |
|---|---|
| `http://localhost:3000` | The hub — an icon grid launcher for all apps |
| `http://notes.localhost:3000` | The Notes app |

The hub shows every app defined in `app/apps/hub/page.tsx`. An orange `!` badge on an app icon means its required MCP env vars are not configured.

---

## 5. Explore the Notes app

Open `http://notes.localhost:3000`. You can create, edit, and delete notes immediately. Data is stored in `local.db`.

If you open `http://localhost:3000` you will see the hub with the Notes icon. Clicking it navigates to `notes.localhost:3000`.

---

## 6. Install as a PWA (optional)

Service workers are disabled in dev mode (`NODE_ENV=development`). To test PWA install:

```bash
pnpm build
pnpm start
```

Then open `http://notes.localhost:3000` in Chrome. The address bar will show an install icon, or the in-app `InstallPrompt` component will appear. On iOS Safari, use the share sheet and tap "Add to Home Screen".

---

## Next steps

- **Create a new app**: type `/create-app` in Claude Code
- **Architecture overview**: [docs/architecture.md](./architecture.md)
- **PWA deep dive**: [docs/pwa-deep-dive.md](./pwa-deep-dive.md)
- **Deploy to production**: [docs/deployment.md](./deployment.md)
