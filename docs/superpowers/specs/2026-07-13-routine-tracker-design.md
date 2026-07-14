# Routine Tracker — Design Document

**Date:** 2026-07-13
**Status:** Approved pending final user review
**Base:** Obytes React Native template (Expo SDK 54, this repo)

## 1. Product Overview

A routine/habit tracker for iOS and Android. Users define goals, attach
schedules (routines) to them, get reminded at chosen times, check off
completions, and watch streaks and stats grow. Google sign-in (optional)
unlocks cross-device sync and backup via a tiny Node.js server. The app is
offline-first: everything works with no account and no network.

**Ambition:** store-ready MVP (App Store + Play Store).
**Cost constraint:** minimize implementation and running costs — free-tier
services only (Firebase Auth, Neon Postgres, Railway/Fly-class hosting,
Sentry, Expo Push).

## 2. Feature Scope (MVP)

### Core (from brief)
1. **Google sign-in** — Firebase Auth (Google provider + anonymous mode).
   The app is fully usable without signing in; Google sign-in attaches an
   identity and unlocks sync.
2. **Goals** — create / edit / archive; name, icon, color, motivation note.
3. **Routine scheduling** — per goal: daily, specific weekdays, or X times
   per week; time of day.
4. **Reminders** — local notifications per routine at a user-set time;
   snooze; notification-permission flow with graceful denial handling.

### Must-haves (added)
5. **Today view (home)** — today's due routines as a checklist; check-off is
   the core interaction.
6. **Completion history & streaks** — per-goal calendar, current/best streak.
7. **Stats** — weekly/monthly completion rates.
8. **Onboarding** — 2–3 screens (template scaffold exists).
9. **Settings** — theme, language (i18n en + existing ar), notification
   defaults, sign out, **account deletion** (store requirement).
10. **Data safety** — local DB export/backup to file.
11. **Crash reporting** — Sentry (app + server).
12. **Store compliance pack** — privacy policy screen, icons, splash,
    permission rationale copy.

### Server features
13. **Sync & backup** — per-user data sync, survives reinstall.
14. **Auth backing** — Firebase ID-token verification server-side.
15. **Push** — re-engagement pushes via Expo Push API (reminders stay local).

### Out of scope (YAGNI)
Social/sharing, widgets, watch apps, gamification beyond streaks, habit
template libraries, analytics platforms, CRDT sync.

## 3. Architecture

### 3.1 App structure (Obytes conventions)

```
src/
├── app/                        # Expo Router
│   ├── (app)/                  # main group — tab navigator
│   │   ├── index.tsx           # Today view (home tab)
│   │   ├── goals/              # list, [id] detail, create/edit modals
│   │   ├── stats.tsx
│   │   └── settings/           # + privacy policy, account deletion
│   ├── login.tsx               # Google sign-in / skip
│   └── onboarding.tsx
├── features/
│   ├── auth/                   # rewired to Firebase Auth + anonymous
│   ├── goals/
│   ├── routines/               # schedule model + picker UI
│   ├── today/
│   ├── history/                # completions, streaks, calendar
│   ├── stats/
│   ├── reminders/              # notification scheduling engine
│   ├── sync/                   # sync client, opportunistic push/pull
│   └── settings/
└── lib/
    ├── db/                     # expo-sqlite + Drizzle: schema, migrations
    └── notifications/          # expo-notifications wrapper
```

### 3.2 Key technical decisions

- **Database:** expo-sqlite + **Drizzle ORM**. Relational data, typed
  schema, migrations, `useLiveQuery` for reactive screens. MMKV remains for
  session/prefs (template default).
- **State:** Drizzle live queries for DB reads; Zustand for auth session and
  transient UI state. React Query reserved for server API calls (sync).
- **Auth:** Firebase Auth. Anonymous by default; Google linking upgrades the
  account. Account deletion = Firebase user delete + `DELETE /account` +
  local wipe.
- **Reminders engine:** iOS caps pending local notifications at 64. A
  reconciler schedules only the next 7 days of reminders, re-running on app
  foreground and after any schedule/reminder edit. Owned by spec
  `013-reminders.md`; highest-scrutiny app module.
- **Styling:** NativeWind on the template's UI kit; design tokens defined in
  spec `002-design-system.md`.

### 3.3 Data model

All synced tables carry `updated_at` and `deleted_at` (soft delete).

```
goals        id, name, icon, color, motivation, archived_at, created_at,
             updated_at, deleted_at
routines     id, goal_id → goals, schedule_type (daily|weekdays|times_per_week),
             weekdays (bitmask), times_per_week, time_of_day, active,
             updated_at, deleted_at
reminders    id, routine_id → routines, offset_min, enabled,
             updated_at, deleted_at
completions  id, routine_id → routines, date (YYYY-MM-DD), completed_at,
             updated_at, deleted_at
```

Streaks and stats are **derived at read time** from `completions` via pure,
heavily unit-tested functions. No stored aggregates that can drift.

### 3.4 Server (`server/` in this repo)

**Stack:** Fastify + TypeScript + Drizzle ORM + Postgres (Neon free tier).
One container (Railway/Fly-class). No queues, no Redis.

```
server/
├── src/
│   ├── db/            # Drizzle schema: app tables + users, devices
│   ├── auth/          # firebase-admin ID-token verification middleware
│   ├── routes/
│   │   ├── sync.ts    # POST /sync — push/pull changed rows
│   │   ├── account.ts # DELETE /account
│   │   └── push.ts    # device (Expo push token) registration
│   └── jobs/          # daily cron: re-engagement push via Expo Push API
└── test/
```

- **Auth:** server never sees credentials; verifies Firebase ID tokens and
  derives `user_id`.
- **Sync protocol (deliberately dumb):** client pushes rows changed since
  last sync, pulls rows changed since last sync; **last-write-wins** per row
  via `updated_at`; soft deletes propagate. No CRDTs. Sync is opportunistic
  (app foreground + after mutations) and silent on failure — offline is a
  normal state. Spec `020-sync-protocol.md` is written and reviewed before
  any other server spec.
- **Push:** routine reminders are always local. Server sends only occasional
  re-engagement pushes through Expo's push service.
- **Server data model additions:** `users`, `devices` (expo push tokens).

## 4. Error Handling

- Every screen spec defines empty / loading / error states (Designer
  enforces).
- Migration failure → "restore from backup" path, never a white screen.
- Sync errors: silent, retried next foreground; "last synced" indicator in
  Settings is the only surface.
- Notification permission denied: routines still work; reminder toggles show
  an "enable in system settings" prompt.
- Server: Zod validation on all endpoints (schemas shared with app where
  practical), typed error envelopes, idempotent endpoints so sync retries
  are safe. Sentry on app and server.

## 5. Testing Strategy

- **Unit (Jest):** streak calculation, stats aggregation, "due today"
  resolution, notification reconciliation (64-slot budget), sync merge
  (LWW + soft deletes). Specs include table-driven cases as acceptance
  criteria.
- **Component (RN Testing Library):** goal form, schedule picker, Today
  check-off.
- **Server (Vitest + real Postgres in CI):** sync round-trips, auth
  middleware, account-deletion completeness.
- **E2E (Maestro):** golden path — onboard → create goal → schedule → check
  off → streak → sign in → reinstall-survives-via-sync. Both platforms, at
  milestone gates.
- **CI:** `pnpm check-all` + server tests per task branch; Maestro at
  milestones.

## 6. Autonomous Agent Team

> **Living version:** §6–8 are superseded by `docs/specs/003-agent-process.md`
> (M1.5); that spec wins on conflict, including plan/ledger file locations.

Six agent roles + the user as Product Owner.

| # | Role | Responsibilities | When |
|---|------|------------------|------|
| 1 | **Architect** | Specs & implementation plan, data model, navigation map, module boundaries, task breakdown, sync protocol spec. Arbitrates Reviewer/Developer disputes. Spec changes route through Architect. | First; each milestone gate |
| 2 | **UI/UX Designer** | Design system (tokens, dark mode, typography) on the Obytes UI kit; per-screen specs/wireframes incl. empty/loading/error states; accessibility; icon & splash. Design-QA of implemented screens against spec. | After Architect; design QA per feature |
| 3 | **Feature Developer** | One app feature module per task (`src/features/`), TDD, Obytes conventions (TanStack Form + Zod, Drizzle, Zustand, NativeWind, `@/` imports). Parallel instances on non-overlapping tasks. | Per task |
| 4 | **Backend Developer** | Server tasks (specs `020+`): sync, auth middleware, push, account deletion. Same SDD pipeline and gates. | Per server task |
| 5 | **Reviewer** | Adversarial diff review against the spec's acceptance criteria: correctness, conventions, type safety, test quality. Rejects back with concrete findings. | Per task |
| 6 | **Release/QA Engineer** | Maestro E2E, store compliance checklist, Sentry setup, EAS profiles, CI, versioning, **per-feature installable dev builds for human device testing**, server deploy + smoke test. | Milestone gates + per-feature builds |

## 7. Process: Spec-Driven Development (SDD)

Every feature is specified in a local doc **before** implementation:

```
docs/
├── specs/
│   ├── 000-product-overview.md
│   ├── 001-data-model.md
│   ├── 002-design-system.md
│   ├── 010-auth-google.md        # app specs: 010+
│   ├── 011-goals-crud.md
│   ├── 012-routine-scheduling.md
│   ├── 013-reminders.md
│   ├── 014-today-view.md
│   ├── 015-history-streaks.md
│   ├── 016-stats.md
│   ├── 017-onboarding.md
│   ├── 018-settings-account.md
│   ├── 019-data-export.md
│   ├── 020-sync-protocol.md      # server specs: 020+
│   ├── 021-server-auth.md
│   ├── 022-push-notifications.md
│   └── 023-store-compliance.md
└── plans/
    └── implementation-plan.md
```

Spec template: **Purpose → User stories → UX spec (Designer) → Data & API
contracts → Acceptance criteria → Out of scope.**

Rules:
- A task is dispatched only when its spec has no open questions.
- Reviewer reviews diffs against spec acceptance criteria, not taste.
- Mid-implementation discoveries update the spec first, code second.

## 8. Merge Policy: Human Verification Gate

No agent merges to `main`.

1. Each feature lives on `feature/<spec-id>-<name>`; the full agent pipeline
   (Developer → Reviewer → QA checks) runs on that branch.
2. Done branches are marked **Ready for human verification** with a hand-off
   note: what to test, spec acceptance criteria as a checklist, and an
   installable dev build (or build instructions) for **both iOS and Android
   devices**.
3. The Product Owner tests on real devices and either merges to `main` or
   returns findings (spec gap → Architect; implementation gap → Developer).
4. Merging to `main` is always a human action. Milestones M1–M5 add broader
   review points on top.

## 9. Milestones

Each milestone ends with a Release/QA gate + Product Owner approval.

1. **M1 – Foundation:** specs 000–002, DB layer + migrations, tab shell,
   design system, CI green.
2. **M2 – Core loop (app-only):** goals CRUD, scheduling, Today view,
   history + streaks. App usable offline here.
3. **M3 – Reminders + stats:** notification engine, stats, onboarding.
4. **M4 – Server + auth:** server skeleton, Firebase auth (app + server),
   sync, push registration, account deletion.
5. **M5 – Store readiness:** Sentry, privacy policy, icons/splash, data
   export, EAS production builds, store listing checklist.

Rationale for ordering: the riskiest pure-logic features (M2/M3) land before
the server so sync is built against a stable data model.
