# 003 — Agent Process (SDD Pipeline)

## Purpose
Single living definition of how autonomous agents build this app. Replaces
§6–8 of the 2026-07-13 design doc; on conflict, this spec wins.

## Roles
| Role | Owns | Cannot |
|------|------|--------|
| Architect | Specs, data model, task breakdown, dispute arbitration | Implement |
| UI/UX Designer | Design system, UX spec sections, design QA | Run code |
| Feature Developer | One `src/features/` module per task, TDD | Merge; change specs |
| Backend Developer | `server/` tasks (M4+, specs 020+) | Merge; change specs |
| Reviewer | Diff-vs-spec verdicts | Edit any file |
| Release/QA | E2E, CI, builds, hand-offs, PRs | Merge |
| **Product Owner (human)** | Merging `main`, device verification, scope | — |

## Dispatch loop (per task)
1. Architect confirms the task's spec section has no open questions.
2. Developer implements on `feature/<spec-id>-<name>`: TDD, conventions
   per `CLAUDE.md`, `pnpm check-all` green before hand-over.
3. Reviewer reads the spec's acceptance criteria, then the diff
   (`git diff <base>...HEAD`), runs the gates, and issues APPROVE or
   REJECT with file:line findings in the ledger. Rejected → back to the
   developer; disputes → Architect (spec updates first).
4. Release/QA pushes the branch, opens the PR (template = hand-off
   format), attaches the hand-off note, and marks it
   **Ready for human verification**.
5. PO tests on iOS + Android devices, then merges — or returns findings
   (spec gap → Architect; implementation gap → Developer).

## Durable state
- Ledger: `docs/process/ledger.md` — one line per task:
  `Task N: <status> (commits <a>..<b>, review <verdict>; <deviations>)`.
  Committed with the work it describes. `.superpowers/` is session
  scratch and stays gitignored.
- Hand-off notes: `docs/process/handoffs/<branch-suffix>.md` — what to
  test on device, acceptance-criteria checklist, known limitations.

## Branch & PR conventions
- Branch: `feature/<spec-id>-<name>` (e.g. `feature/011-goals-crud`).
  Milestone-wide branches use `feature/m<N>-<name>`.
- Conventional commits, enforced by commitlint.
- One PR per feature branch, base `main`, body follows
  `.github/PULL_REQUEST_TEMPLATE.md`. CI (test, type-check, lint incl.
  hook tests) must be green before human review.

## Enforcement (defense in depth)
1. `.claude/settings.json` — shared allow/deny permission rules.
2. `.claude/hooks/guard-main.sh` — blocks push/merge/commit on `main`.
3. `.claude/hooks/guard-native-dirs.sh` — blocks writes to `android/`, `ios/`.
4. Husky pre-commit — branch check + type-check + lint-staged (local only).
5. GitHub branch protection (below) — the backstop agents cannot bypass.

## Branch protection — one-time HUMAN setup (Product Owner)
On github.com/holybora/iApp → Settings → Branches → Add rule for `main`:
- [ ] Require a pull request before merging (no direct pushes)
- [ ] Require status checks: `Tests`, `Type Check`, `Lint TS (eslint, prettier)`
- [ ] Require branches to be up to date before merging
- [ ] Do NOT allow force pushes or deletions

## Out of scope
- Skill-encoded dispatch automation (may layer on later).
- GitHub Issues as task state (repo ledger chosen instead).
