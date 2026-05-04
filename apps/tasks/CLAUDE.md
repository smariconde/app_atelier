# apps/tasks/

Tasks app workspace package. Personal task manager with priorities and due dates.

## Manifest

- **id / subdomain**: `tasks` → `tasks.localhost:3000` in dev
- **icon**: `list-checks` (Lucide)
- **color**: `#10B981` (emerald)
- **status**: `beta`
- **tablePrefix**: `tasks_`

## Database schema

`db/schema.ts` — one table: `tasks_tasks`

| Column | Type | Notes |
|---|---|---|
| `id` | text | cuid2, primary key |
| `title` | text | required, default empty string |
| `description` | text | default empty string |
| `priority` | text | `low`, `medium`, or `high` — default `medium` |
| `completed` | boolean | default false |
| `due_date` | timestamp | nullable |
| `created_at` | timestamp | auto-set on insert |
| `updated_at` | timestamp | auto-set on insert |

## UI routes

Pages live in `app/apps/tasks/`:
- `/` (rewritten from `tasks.localhost:3000`) → `page.tsx` — list + inline create form
- `/[id]` → `[id]/page.tsx` — view + edit + delete

Server actions in `app/apps/tasks/actions.ts`: `createTask`, `updateTask`, `deleteTask`.
