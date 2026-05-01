# apps/notes/

Notes app workspace package. Simple personal note-taking — list, create, edit, delete.

## Manifest

- **id / subdomain**: `notes` → `notes.localhost:3000` in dev
- **icon**: `notebook-pen` (Lucide)
- **color**: `#F59E0B` (amber)
- **tablePrefix**: `notes_`

## Database schema

`db/schema.ts` — one table: `notes_notes`

| Column | Type | Notes |
|---|---|---|
| `id` | text | cuid2, primary key |
| `title` | text | default empty string |
| `content` | text | default empty string |
| `created_at` | integer | timestamp mode |
| `updated_at` | integer | timestamp mode |

## UI routes

Pages live in `app/apps/notes/`:
- `/` (rewritten from `notes.localhost:3000`) → `page.tsx` — list + inline create form
- `/[id]` → `[id]/page.tsx` — view + edit + delete

Server actions in `app/apps/notes/actions.ts`: `createNote`, `updateNote`, `deleteNote`.
