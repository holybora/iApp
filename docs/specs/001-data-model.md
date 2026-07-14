# 001 — Data Model

## Purpose
Single source of truth for the client SQLite schema (Drizzle ORM). The
server mirrors these tables plus `users` and `devices` (spec 020).

## Conventions
- IDs: UUID v4 strings, generated client-side (expo-crypto `randomUUID`).
- Timestamps: integer epoch milliseconds (UTC).
- Dates: `YYYY-MM-DD` local-date strings (a completion belongs to the
  user's local day, not a UTC instant).
- Soft delete: every synced table has `deleted_at` (null = live).
  Rows are never hard-deleted on-device except by full account wipe.
- Sync: every synced table has `updated_at`, set on every write.

## Tables

### goals
| column | type | constraints |
|--------|------|-------------|
| id | text | PK |
| name | text | NOT NULL |
| icon | text | nullable (icon key) |
| color | text | nullable (token name from spec 002) |
| motivation | text | nullable |
| archived_at | integer | nullable |
| created_at | integer | NOT NULL |
| updated_at | integer | NOT NULL |
| deleted_at | integer | nullable |

### routines
| column | type | constraints |
|--------|------|-------------|
| id | text | PK |
| goal_id | text | NOT NULL, FK → goals.id |
| schedule_type | text | NOT NULL, one of `daily` \| `weekdays` \| `times_per_week` |
| weekdays | integer | nullable; bitmask bit0=Monday … bit6=Sunday; required when schedule_type=weekdays |
| times_per_week | integer | nullable; 1–7; required when schedule_type=times_per_week |
| time_of_day | text | nullable; `HH:mm` 24h local |
| active | integer(bool) | NOT NULL default true |
| updated_at | integer | NOT NULL |
| deleted_at | integer | nullable |

### reminders
| column | type | constraints |
|--------|------|-------------|
| id | text | PK |
| routine_id | text | NOT NULL, FK → routines.id |
| offset_min | integer | NOT NULL default 0 (minutes BEFORE routine time_of_day) |
| enabled | integer(bool) | NOT NULL default true |
| updated_at | integer | NOT NULL |
| deleted_at | integer | nullable |

### completions
| column | type | constraints |
|--------|------|-------------|
| id | text | PK |
| routine_id | text | NOT NULL, FK → routines.id |
| date | text | NOT NULL, `YYYY-MM-DD` |
| completed_at | integer | NOT NULL |
| updated_at | integer | NOT NULL |
| deleted_at | integer | nullable |

UNIQUE (routine_id, date) — one completion per routine per local day.

## Derived data (never stored)
Streaks, completion rates, and "due today" resolution are pure functions
over `routines` + `completions`, defined and tested in their feature specs
(012, 015, 016).

## Acceptance criteria
- Drizzle schema in `src/lib/db/schema.ts` matches these tables exactly.
- drizzle-kit migration generated to `src/lib/db/migrations/`.
- Jest suite proves: migration applies to an empty DB; FK constraints
  enforced; UNIQUE(routine_id, date) enforced; CRUD round-trip per table.
