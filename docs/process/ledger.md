# Routine Tracker — SDD Ledger

Format (spec 003): `Task N: <status> (commits <a>..<b>, review <verdict>; <deviations/notes>)`

## M1 — Foundation (migrated from .superpowers/sdd/progress.md, 2026-07-13)

Task 1: complete (commits 4e68c52..c4d3e36, review clean)
Task 2: complete (commits c4d3e36..cce42b6, review clean; minor: implementer report miscounted feature index, artifact correct)
Task 3: complete (commits cce42b6..ee65deb, review clean; controller added .superpowers/ ignores in follow-up commit; env note: flaky watchman, use jest --watchman=false if hangs; lockfile surfaced pre-existing deprecation notices on transitive deps)
Task 4: complete (commits fcb3ca1..28a9f1b, review clean; minor for final review: schema test covers Create+Read only vs spec 'CRUD round-trip'; FK test only on routines.goal_id; schedule_type enum is TS-level only, no SQL CHECK)
Task 5: complete (commits 28a9f1b..1cf6bcf, review clean; justified deviation: src/types/sql.d.ts ambient *.sql declaration; minor for final review: could colocate as src/lib/db/sql.d.ts per repo convention; pre-existing act() warning noise in one template test)
Task 6: complete (commits 1cf6bcf..25e83c0, review clean; IMPORTANT assigned to Task 7: stale .maestro flows (tabs.yaml, create-post.yaml) reference deleted Feed/Style UI; minor for final review: unused Feed/Style icons still exported; 3 placeholder screens copy-paste identical — possible shared helper later)
Task 7: complete (commits 25e83c0..906c736, review clean; maestro flows fixed incl. login flows; commit-msg deviation justified by commitlint; branch NOT pushed)
Final review: With fixes → fix commit 410ecc1 (CRUD/FK tests per spec 001 + maestro settings-tab assert), 8/8 passing, type-check+lint clean; re-review pending
Final review: re-review clean, gate cleared — Ready for human device verification (merge is human action per design spec §8). M2 note: updated_at bump is app-layer, test in M2 write helpers; @/lib/db not jest-safe, mock/lazy-init needed in M2.
Hand-off: docs/process/handoffs/m1-foundation.md

## M1.5 — Agent Harness Hardening (plan: docs/superpowers/plans/2026-07-13-m1.5-agent-harness.md)
