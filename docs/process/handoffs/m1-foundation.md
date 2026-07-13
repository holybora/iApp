# M1 Foundation — Ready for human verification

**Branch:** `feature/m1-foundation` (do not merge without device testing)

## What to test on BOTH iOS and Android devices
1. `pnpm ios` / `pnpm android` — app builds and launches.
2. Splash screen hides; onboarding appears on first launch; after
   onboarding, login screen appears; after login, the tab shell shows.
3. Four tabs: Today, Goals, Stats, Settings — each opens its screen with
   the correct title and empty-state text; no Feed/Style tabs remain.
4. Dark mode (Settings → Theme): all four screens legible in both themes.
5. Language switch (Settings → Language → Arabic): tab titles change; RTL
   layout renders.
6. Relaunch the app — no migration error screen (DB migrated on first
   launch, idempotent on second).

## Acceptance criteria checklist (from specs 000–002)
- [ ] Drizzle schema matches spec 001 tables exactly (reviewed)
- [ ] Migration applies on empty DB; FK + UNIQUE enforced (Jest green)
- [ ] Tab shell matches spec 002 navigation map
- [ ] Every placeholder screen has an empty state
- [ ] `pnpm check-all` green

## Known limitations (by design, M1)
- Login is the template's dummy auth (Firebase arrives in M4).
- Screens are placeholders; core loop lands in M2.
- Maestro flows updated but not executed in-session.
