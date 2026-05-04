# apps/habits/

Habits app workspace package. Track daily habits and build streaks.

## Manifest

- **id / subdomain**: `habits` → `habits.localhost:3000` in dev
- **icon**: `repeat-2` (Lucide)
- **color**: `#F43F5E` (rose)
- **tablePrefix**: `habits_`

## Database schema

`db/schema.ts` — two tables:

### `habits_habits`

| Column | Type | Notes |
|---|---|---|
| `id` | text | cuid2, primary key |
| `name` | text | habit name, default empty string |
| `description` | text | default empty string |
| `color` | text | hex color, default `#F43F5E` |
| `created_at` | timestamp | auto-set on insert |
| `updated_at` | timestamp | auto-set on insert |

### `habits_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | text | cuid2, primary key |
| `habit_id` | text | foreign key to habits |
| `date` | text | ISO date string (e.g. `2025-01-15`) |
| `completed` | boolean | default false |
| `created_at` | timestamp | auto-set on insert |

## UI routes

Pages live in `app/apps/habits/`:
- `/` (rewritten from `habits.localhost:3000`) → `page.tsx` — habit list + create form + streak display
- `/[id]` → `[id]/page.tsx` — habit detail + entry log

Server actions in `app/apps/habits/actions.ts`: `createHabit`, `updateHabit`, `deleteHabit`, `toggleEntry`.
