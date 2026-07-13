# 000 — Product Overview

## Purpose
Offline-first routine/habit tracker for iOS and Android. Users define
goals, attach scheduled routines, get local reminders, check off
completions, and track streaks/stats. Optional Google sign-in unlocks
sync/backup via a tiny Node.js server. Store-ready MVP; free-tier
services only.

## Personas
- **Habit builder:** wants a frictionless daily checklist and streaks.
- **Privacy-conscious user:** uses the app without any account, offline.
- **Multi-device user:** signs in with Google to keep data across devices.

## Feature index (spec ownership)
| Spec | Feature | Milestone |
|------|---------|-----------|
| 001 | Data model | M1 |
| 002 | Design system | M1 |
| 003 | Agent process | M1.5 |
| 010 | Auth (Google + anonymous) | M4 |
| 011 | Goals CRUD | M2 |
| 012 | Routine scheduling | M2 |
| 013 | Reminders (local notifications) | M3 |
| 014 | Today view | M2 |
| 015 | History & streaks | M2 |
| 016 | Stats | M3 |
| 017 | Onboarding | M3 |
| 018 | Settings & account deletion | M4 |
| 019 | Data export | M5 |
| 020 | Sync protocol | M4 |
| 021 | Server auth | M4 |
| 022 | Push notifications | M4 |
| 023 | Store compliance | M5 |

## Spec template (all specs 010+)
Purpose → User stories → UX spec → Data & API contracts →
Acceptance criteria → Out of scope.

## Process rules
- SDD: no implementation task is dispatched without an approved spec.
- Reviewer reviews against acceptance criteria, not taste.
- Spec changes precede code changes.
- No agent merges to main; human verifies on iOS + Android devices first.

## Out of scope (whole MVP)
Social/sharing, widgets, watch apps, gamification beyond streaks, habit
template libraries, analytics platforms, CRDT sync.
