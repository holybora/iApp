# Routine Tracker — Project Instructions

Offline-first routine/habit tracker for iOS and Android: users define goals,
attach scheduled routines, get local reminders, check off completions, and
track streaks/stats. Optional Google sign-in (M4) unlocks sync via a small
Node server. **Read `docs/specs/000-product-overview.md` before any product
work.** Base: Obytes React Native template.

## Process (SDD) — non-negotiable

- **Spec before code.** No implementation without an approved spec in
  `docs/specs/`. The pipeline (roles, dispatch loop, review gates, hand-off
  format) is `docs/specs/003-agent-process.md`.
- **TDD.** Failing test → minimal implementation → green → commit.
- **No agent merges to or pushes `main`. Ever.** Human merges after device
  verification. Enforced by `.claude/hooks/guard-main.sh`.
- Work on `feature/<spec-id>-<name>` branches; one PR per feature with the
  spec's acceptance criteria as a checklist.
- Record task status, review verdicts, and deviations in
  `docs/process/ledger.md`; hand-off notes go in `docs/process/handoffs/`.
- Spec ambiguous or wrong? STOP; escalate to the architect (ledger entry).
  The spec changes first, code second.

## Where things live

- Specs: `docs/specs/` — 000 product, 001 data model, 002 design system,
  003 agent process; 010+ app features, 020+ server.
- Plans: `docs/superpowers/plans/` · Design docs: `docs/superpowers/specs/`
- Ledger + hand-offs: `docs/process/`
- Agent roles: `.claude/agents/` · Guard hooks: `.claude/hooks/`
- Local DB: `src/lib/db/` (Drizzle + expo-sqlite; migrations via
  `pnpm drizzle-kit generate`, applied on app start).
- Server (from M4): `server/` — does not exist yet.

## Environment knowledge (hard-won; append when you learn more)

- **pnpm only** (`preinstall` enforces). Expo-managed native deps:
  `pnpm expo install <pkg>`; pure JS: `pnpm add`.
- Jest runs with `watchman: false` (jest.config.js) — the daemon is broken
  on this machine; do not re-enable.
- `better-sqlite3` (tests only) required a pnpm native-build approval —
  already configured in `package.json`.
- `pnpm prebuild:*` sets `STRICT_ENV_VALIDATION=1` and fails without a
  `.env.development` — copy `.env.development.example`. Plain
  `start`/`test`/`lint`/`type-check` need no env file.
- Verification gate for every task: `pnpm check-all`
  (lint + type-check + lint:translations + test).
- Running `tsc` locally regenerates `uniwind-types.d.ts` in a format that
  fails eslint. If lint fails only on that file: `pnpm lint:fix`, then
  `git checkout -- uniwind-types.d.ts`. Never commit the regenerated form.
  (CI is unaffected — its jobs are isolated.)
- `src/translations/en.json` and `ar.json` must stay key-synchronized.

## Technology Stack

- **Expo SDK 54** + React Native 0.81, **Expo Router 6** (file-based routes
  in `src/app/`), **TypeScript** strict.
- **Drizzle ORM + expo-sqlite** for domain data; **MMKV**
  (`src/lib/storage.tsx`) for session/prefs; **Zustand** for transient UI /
  auth state; **React Query** reserved for server calls (M4+).
- **NativeWind/Uniwind** styling on the UI kit in `src/components/ui/`.
- **TanStack Form + Zod** for forms. **Jest + RN Testing Library** for
  tests; **Maestro** (`.maestro/`) for E2E.

## Essential Rules

- ✅ Absolute imports only: `@/components/ui/button` — never relative
  across folders.
- ✅ Feature modules: `src/features/<name>/` — one module per task.
- ✅ Every screen defines empty, loading, and error states (spec 002).
- ❌ Never modify `android/` or `ios/` directly (Expo config plugins only;
  enforced by `.claude/hooks/guard-native-dirs.sh`).
- ❌ No react-hook-form (use TanStack Form), no AsyncStorage (use MMKV),
  no new paid services (free tier only).

## Commands

```bash
pnpm start          # dev server        pnpm check-all   # full quality gate
pnpm ios / android  # run on platform   pnpm test:hooks  # guard-hook tests
pnpm lint / type-check / test           pnpm e2e-test    # Maestro (device)
```
