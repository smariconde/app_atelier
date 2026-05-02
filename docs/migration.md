# Migrating to v1.0

## What changed in v1.0

v1.0 marks the stability point for the core manifest contract. Two packages are now semver-stable:

- **`@hub/core` 1.0.0** — `defineManifest` and `AppManifest` are stable APIs. Breaking changes (removed or renamed fields) will only ship in future major versions (2.0.0, etc.).
- **`@hub/pwa` 1.0.0** — `buildPWAManifest` and `InstallPrompt` are stable APIs with the same guarantee.

There are **no breaking changes** in the manifest API between v0.6 and v1.0. If your apps ran on v0.6, they run on v1.0 without modification.

---

## What is stable (semver-governed)

| API | Package | Stable since |
|---|---|---|
| `defineManifest(manifest)` | `@hub/core` | v1.0 |
| `AppManifest` TypeScript type | `@hub/core` | v1.0 |
| `buildPWAManifest(app)` | `@hub/pwa` | v1.0 |
| `<InstallPrompt />` component | `@hub/pwa` | v1.0 |

Stable means: existing call sites will not break on minor or patch updates. New optional fields may be added in minor versions. Fields will not be removed or renamed without a major version bump.

---

## What is still evolving

The AI Studio (`.claude/` directory) is **not** semver-governed. Agent definitions, skill workflows, and hook configurations are living documents — they improve continuously and may change structure between versions without a major bump.

If you have customized `.claude/agents/` or `.claude/skills/`, review the diff when pulling upstream changes and re-apply your customizations.

The database adapter interface (`@hub/db`) is functional but not yet declared stable. The API may change in a minor version. Check the changelog before updating if you have custom adapter integrations.

---

## Migration steps (for forks of v0.x)

If you forked AppAtelier before v1.0 and want to update to the stable release:

**1. Update package references**

```bash
# In package.json files that reference @hub/* packages,
# update the version constraint if you pinned a specific version.
# If you use workspace:* (the default), pnpm resolves to the local package
# and no change is needed.
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Run doctor**

```bash
pnpm doctor
```

Doctor will report any manifest fields that are missing or have changed format. Fix any warnings it reports.

**4. Run type-check**

```bash
pnpm typecheck
```

`AppManifest` has not changed between v0.6 and v1.0, so this should pass without changes.

**5. Run the dev server and verify**

```bash
pnpm dev
```

Open `http://localhost:3000` and each app subdomain. If everything loads and `pnpm doctor` passes, the migration is complete.

---

## Changelog: v0.6 → v1.0

- `@hub/core` and `@hub/pwa` bumped to 1.0.0 (no API changes, stability declaration only)
- `AppManifest` type: no field additions or removals
- `buildPWAManifest`: no behavior changes
- `defineManifest`: no changes
- AI Studio: agents updated for clarity; no skill workflow changes
- CI workflow: unchanged
- Scripts: unchanged

---

## Getting help

If you hit an issue migrating, the `architecture` agent has full knowledge of the codebase:

```
/architecture Why did X break after updating?
```

Or open an issue describing what you changed and what error you're seeing.
