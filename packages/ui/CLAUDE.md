# @hub/ui

shadcn/ui-style components with Tailwind. Dark mode is the default (root layout applies `class="dark"`).

## Using components

```typescript
import { Button, Card, CardContent, Input, Textarea, Badge, cn } from '@hub/ui'
```

## cn() utility

Merges Tailwind classes safely (clsx + tailwind-merge):
```typescript
cn('px-4 py-2', isActive && 'bg-primary', className)
```

## Available components

**Primitives** (shadcn/ui-style):

| Component | File |
|---|---|
| `Button` | `components/button.tsx` — variants: default, destructive, outline, secondary, ghost, link |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `components/card.tsx` |
| `Input` | `components/input.tsx` |
| `Textarea` | `components/textarea.tsx` |
| `Badge` | `components/badge.tsx` — variants: default, secondary, destructive, outline |

**App layout components** (use in every app page):

| Component | Props | Purpose |
|---|---|---|
| `AppContainer` | `as?` (`'main'`\|`'div'`), `className?` | Page wrapper — `min-h-screen bg-zinc-950 p-6 max-w-2xl mx-auto` |
| `PageHeader` | `title?`, `subtitle?`, `backHref?`, `backLabel?`, `action?` | Title block or back navigation |
| `FormCard` | `className?` | Create/edit form container — `bg-zinc-900 rounded-xl p-4 border border-zinc-800` |
| `ItemCard` | `as?` (`'li'`\|`'div'`), `className?` | List item card with hover state |
| `EmptyState` | `heading`, `subtext?` | Empty list placeholder |
| `DeleteButton` | `formAction`, `confirmMessage?`, `label?` | Delete with confirm dialog (`'use client'`) |

## Adding a new component

1. Create `src/components/<name>.tsx`
2. Export from `src/index.ts`
3. Follow the existing pattern: `React.forwardRef`, accept `className`, use `cn()`

## Tailwind

The root `tailwind.config.ts` covers `app/**` and `packages/ui/src/**`. CSS variables for colors are defined in `app/globals.css`. Do not duplicate the config in individual packages.
