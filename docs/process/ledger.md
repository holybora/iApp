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

Task 0: complete (branch feature/m1.5-agent-harness cut from feature/m1-foundation at 4b350ad; setup only, no code review needed)
Task 1: complete (commits 3598c98+dacee60, review approved after fix loop; fix loop closed 2 plan-mandated gaps — bare push on main, merge-base false positive — plus a dogfooding-found quoted-text false positive, verified byte-for-byte; minors for final review: checkout-main-then-push compound bypass mitigated by settings allowlist, safe-direction FP on text spelling out a push-of-main command, bare merge-with-no-args end-anchor untested)
Task 2: complete (commits cc81d3f+3465bd9, review approved after fix loop; CLAUDE.md rename rebuilt as a pure-rename commit so `git log --follow` traverses, verified byte-identical; justified deviation: eslint filename-case ignore entry for CLAUDE.md; minor: one-commit lint-red window at cc81d3f)
PO decision mid-M1.5: EAS project kept REAL (commit 5b06a75) — app.config.ts left untouched by Task 6, spec+plan amended accordingly
Task 3: complete (commits 17212bb+d5ba5d2, review approved; review caught a plan-inherited defect — branch-protection checklist used display-inexact CI job names, fixed to 'Tests (jest)'/'Type Check (tsc)' in spec 003 + plan)
Task 4: complete (commit cd11b4a, review approved clean; ledger content verbatim, hand-off move is a 100%-similarity rename)
External activity mid-M1.5: another session committed 6363dfd (splash hideAsync fallback + maestro path repair) onto this branch during M1 device verification; PO chose fold-into-M1 — cherry-picked to feature/m1-foundation as d67b83b, duplicate dropped at rebase
Task 5: complete (commit a9248be, review approved clean; all six agent role defs point at spec 003 + ledger, role consistency verified)
Task 6: complete (commit dee607a, review approved; implementer caught an unlisted leftover e2e-android-eas-build.yml; minors for final review: composite-action files still say 'staging' in comments/default (inert), env inheritance for EXPO_PUBLIC_API_URL only provable by a real CI run of the label-gated e2e workflow)
Task 7: complete (commit 35e263f, review approved; PROCESS NOTE: implementer's first report fabricated raw coverage numbers — controller caught the arithmetic inconsistency and implementer corrected the report; committed floors 35/35/35/30 verified against real coverage-summary.json and a controller-run test:ci; env note: plain test:ci crashes on this machine, use --watchman=false; pre-existing act() warning + worker-exit noise in login-form test)
Task 8: complete (commit a657621, review approved clean, byte-for-byte)
Final review: check-all (lint, type-check, translations, test 49/49) + test:hooks (23/23) all green on feature/m1.5-agent-harness; test required --watchman=false workaround for a pre-existing watchman crash on this machine — gate cleared, ready for human verification
Hand-off: docs/process/handoffs/m1.5-agent-harness.md
