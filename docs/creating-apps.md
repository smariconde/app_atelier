# Creating Apps

Two ways to create a new app: the `/create-app` AI skill (recommended), or manually. Both end up in the same place.

---

## The fast way: `/create-app`

Type `/create-app` in Claude Code. The skill guides you through a brief, produces a spec for your approval, scaffolds the app, and implements the UI. See [docs/ai-studio.md](./ai-studio.md) for the full walkthrough.

---

## The manual way

### 1. Scaffold from template

```bash
pnpm new-app <name>
```

Where `<name>` is lowercase letters and hyphens only (e.g., `tasks`, `habit-tracker`). This copies `apps/_template/` to `apps/<name>/`, replacing `__APP_ID__` and `__APP_NAME__` placeholders throughout.

After scaffolding, the script prints two manual wiring steps you must complete.

### 2. Wire the manifest registry

**`app/manifest.ts`** — add an import and a registry entry so the PWA manifest endpoint returns the right manifest for your app's subdomain:

```typescript
import tasksApp from '../apps/tasks/manifest'

const registry: Record<string, AppManifest> = {
  notes: notesApp,
  tasks: tasksApp,   // ← add this
}
```

**`app/apps/hub/page.tsx`** — add an import and an entry in the apps array so the hub shows your app's icon:

```typescript
import tasksApp from '../../../../apps/tasks/manifest'

const apps = [notesApp, tasksApp]   // ← add tasksApp
```

### 3. Update the manifest

Edit `apps/<name>/manifest.ts` to describe your app:

```typescript
import { defineManifest } from '@hub/core'

export default defineManifest({
  id: 'tasks',
  subdomain: 'tasks',
  name: 'Tasks',
  description: 'Simple personal task list',
  icon: 'check-square',       // Lucide icon name (kebab-case)
  color: '#6366F1',           // hex — used for icon background in hub
  enabled: true,
  status: 'stable',

  pwa: {
    themeColor: '#6366F1',
    backgroundColor: '#09090B',
    display: 'standalone',
    icons: [
      { src: '/tasks-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/tasks-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/tasks-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },

  database: {
    schemaPath: './db/schema.ts',
    tablePrefix: 'tasks_',     // REQUIRED — all tables must start with this
  },
})
```

### 4. Set up the database schema

Edit `apps/<name>/db/schema.ts`. Every table name must start with `tablePrefix`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const tasks = sqliteTable('tasks_tasks', {   // ← prefix: tasks_
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull().default(''),
  done: integer('done', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

Then push the schema to the database:

```bash
pnpm db:setup
```

`drizzle-kit` auto-discovers schemas by globbing `apps/*/db/schema.ts` — no registration needed.

### 5. Add Next.js routes

Create `app/apps/<name>/`:

```
app/apps/tasks/
  layout.tsx      ← import InstallPrompt, set metadata
  page.tsx        ← main view (list + create form)
  actions.ts      ← server actions (createTask, updateTask, deleteTask)
  [id]/
    page.tsx      ← detail/edit view (optional)
```

Use `app/apps/notes/` as a reference implementation.

---

## defineManifest field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique identifier. Lowercase, hyphens allowed. Matches the directory name. |
| `subdomain` | `string` | yes | The subdomain. Usually identical to `id`. |
| `name` | `string` | yes | Display name shown in the hub icon and browser tab. |
| `description` | `string` | no | Short tagline (under 60 chars recommended). Used in the PWA manifest. |
| `version` | `string` | no | Semver string. Informational only. |
| `icon` | `string` | yes | Lucide icon name in kebab-case (e.g., `notebook-pen`, `check-square`). |
| `color` | `string` | yes | Hex color for the icon background in the hub (e.g., `#F59E0B`). |
| `enabled` | `boolean` | yes | `false` hides the app from the hub without removing it. |
| `status` | `'stable' \| 'beta' \| 'experimental'` | yes | Shown as a badge in the hub on non-stable apps. |
| `pwa.themeColor` | `string` | yes | Browser chrome color. Usually matches `color`. |
| `pwa.backgroundColor` | `string` | yes | Splash screen background. Use `#09090B` for dark. |
| `pwa.display` | `'standalone' \| 'fullscreen' \| 'minimal-ui' \| 'browser'` | yes | Use `standalone` for a native-feeling app. |
| `pwa.orientation` | `'portrait' \| 'landscape' \| 'any'` | no | Lock orientation. Omit for unrestricted. |
| `pwa.icons` | `Array<{src, sizes, type?, purpose?}>` | yes | At minimum: 192px, 512px, and a 512px maskable icon. |
| `database.schemaPath` | `string` | if DB used | Relative path to the Drizzle schema file. |
| `database.tablePrefix` | `string` | if DB used | **Required.** All table names must start with this (e.g., `tasks_`). |
| `database.migrations` | `string` | no | Path to migrations directory. Optional; push mode works without it. |
| `aiContext.description` | `string` | no | Plain-language description for AI agents. |
| `aiContext.domain` | `string` | no | Category (e.g., `productivity`, `health`, `finance`). |
| `aiContext.examples` | `string[]` | no | Example user utterances for AI context. |
| `mcpServers` | `string[]` | no | MCP server IDs the app uses. Known values: `gmail`, `google-calendar`, `notion`, `drive`. |

---

## The tablePrefix rule

Every Drizzle table must be named `<tablePrefix><tablename>`. The prefix prevents collisions when multiple apps share the same SQLite file (or Postgres schema).

Example with `tablePrefix: 'tasks_'`:
- `tasks_tasks` — the main tasks table
- `tasks_tags` — a tags table
- `tasks_task_tags` — a join table

Never name a table without the prefix. `pnpm doctor` will warn if it detects a schema violation.

---

## Generate icons

After creating an app, generate PWA icons from a 1024×1024 PNG:

```bash
pnpm generate-icons --input ./my-icon.png --app tasks
```

Output files written to `public/`:
- `tasks-icon-192.png`
- `tasks-icon-512.png`
- `tasks-icon-maskable.png` (icon centered at 80% with padding, on zinc-950 background)

---

## Verify everything works

```bash
pnpm doctor     # validates manifests, schemas, PWA config
pnpm typecheck  # type-check the whole monorepo
pnpm dev        # start the dev server
```

Open `http://<name>.localhost:3000` — you should see your app. Open `http://localhost:3000` — you should see your app's icon in the hub.
