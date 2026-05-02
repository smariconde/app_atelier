# Contributing to AppAtelier

AppAtelier is a personal-software platform heading toward its v1.0 public release. Contributions that help close the gap between "I described what I want" and "the app is on my phone" are the most valuable ones right now.

---

## What's most useful right now

Based on the [ROADMAP.md](ROADMAP.md) v1.0 goals, the highest-impact contributions are:

1. **New example apps** — real apps you've built for yourself that demonstrate what the paradigm enables. The goal is at least 5 community-contributed apps before v1.0.
2. **New agent definitions** — specialists for domains the studio doesn't yet cover (finance, health, media, travel, etc.).
3. **New skills** — workflows you find yourself invoking repeatedly that aren't covered by the existing 7 skills.
4. **Non-Vercel deploy docs** — guides for Coolify, Dokploy, Fly.io, and self-hosted setups. The architecture supports it; the docs don't exist yet.

Bug fixes and quality improvements to the core packages (`@hub/core`, `@hub/pwa`, `@hub/db`, `@hub/auth`) are always welcome.

---

## What's explicitly NOT in scope

These keep getting suggested. The answer is no — please don't open PRs for:

- **One Vercel project per app** — middleware routing gives subdomain isolation with a single project
- **Multi-tenancy** — this is personal software, audience of one. For SaaS use [Makerkit](https://makerkit.dev)
- **Payments or billing** — not a SaaS, not needed
- **An admin panel for managing users** — there's one user (you)
- **Public app marketplace** — security and trust at that scale is a separate product
- **Hub widgets or dashboards** — the hub is a launcher, not a dashboard. Intentional.
- **Visual no-code builder** — the studio *is* the builder

See the [Explicitly out of scope](ROADMAP.md#-explicitly-out-of-scope) section in ROADMAP.md for the full list.

---

## Development setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-fork>/appatelier.git
cd appatelier

# 2. Install dependencies (requires pnpm ≥ 9 and Node ≥ 20)
pnpm install

# 3. Copy env template
cp .env.example .env

# 4. Create the local database and run all migrations
pnpm db:setup

# 5. Start the dev server
pnpm dev
```

The hub is at `localhost:3000`. The Notes example app is at `notes.localhost:3000` and is fully installable as a PWA from your local machine.

---

## Running checks

```bash
pnpm test          # unit tests (Vitest)
pnpm typecheck     # TypeScript across the entire monorepo
pnpm lint          # ESLint across the entire monorepo
pnpm doctor        # validates all manifests, schemas, PWA configs
```

All four must pass before opening a PR. The `pnpm doctor` check also runs automatically as a pre-commit hook.

---

## How to add a new example app

Example apps live under `apps/` (the Next.js route) and `apps/<name>/` (the workspace package with the manifest). The fastest way to scaffold one:

```bash
pnpm new-app <name> --interactive
```

This creates the full directory structure, wires the manifest registry, and makes the app available at `<name>.localhost:3000` immediately.

After scaffolding, implement the app:

1. **Define the schema** — edit `apps/<name>/db/schema.ts`. Every table must be prefixed with `manifest.database.tablePrefix` (e.g., `fitness_entries`).
2. **Write server actions** — add `app/apps/<name>/actions/` with Drizzle queries.
3. **Build the pages** — use components from `@hub/ui`; keep them consistent with the rest of the apps.
4. **Update the manifest** — fill in `aiContext.description` and `aiContext.examples` so the studio understands what the app does.
5. **Run `pnpm doctor`** — fix any reported issues before committing.
6. **Include a screenshot** — add `apps/<name>/screenshot.png` (1280×720) so it renders nicely in the hub and in the issue template.

When opening a PR for a new example app, use the [New Example App](.github/ISSUE_TEMPLATE/new_example_app.yml) issue template and include the PR link.

---

## How to add a new agent

Agent definitions live in `.claude/agents/`. Each agent is a single Markdown file that scopes the agent to a specific role.

1. Create `.claude/agents/<name>.md`.
2. Follow the structure of an existing agent (e.g., `app-builder.md`):
   - A short description of the agent's role
   - The tools it is allowed to use
   - The inputs it expects and the outputs it produces
   - Any approval gates or hand-off points
3. If the agent should be invoked by a skill, wire it in the relevant `.claude/skills/<skill>.md`.
4. Update the agent table in `.claude/CLAUDE.md`.

---

## How to add a new skill

Skills live in `.claude/skills/`. A skill is a workflow that orchestrates one or more agents.

1. Create `.claude/skills/<name>.md`.
2. Define the trigger phrases (the natural-language inputs that invoke the skill).
3. Describe the phases, which agents run in each phase, and where the approval gates are. Every spec and every deploy must have an explicit approval gate.
4. Update the skill table in `.claude/CLAUDE.md` and in the root `CLAUDE.md`.

---

## PR requirements

Before submitting a pull request, make sure:

- [ ] `pnpm doctor` passes (no manifest or PWA validation errors)
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (no errors; warnings are acceptable for now)
- [ ] Documentation is updated if you changed a public API or added a new feature
- [ ] `ROADMAP.md` is updated if your PR delivers a tracked milestone item

Use the [pull request template](.github/pull_request_template.md) when opening your PR.

---

## Commit message style

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature or new example app |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `chore` | Build process, tooling, dependency updates |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `ci` | CI configuration changes |

**Scopes** match the package or area: `core`, `pwa`, `db`, `auth`, `ui`, `hub`, `studio`, `scripts`, `docs`, or an app name (e.g., `notes`, `habits`).

Examples:

```
feat(db): add MySQL adapter for PlanetScale
fix(pwa): correct maskable icon padding in icon generator
docs(studio): add Coolify self-hosted deploy guide
feat(apps): add "Reading Log" example app
```

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) that covers this project.
