# M1.5 — Agent Harness Hardening — Design Document

**Date:** 2026-07-13
**Status:** Approved by Product Owner (this session)
**Base:** Routine Tracker repo, after M1 completes (`feature/m1-foundation` Task 7 done)
**Origin:** Project review of 2026-07-13 — audit of structure, docs, and agent
harness for autonomous development readiness.

## 1. Problem

M1 built a strong SDD core (specs 000–002, six agent roles, DB layer), but the
harness around it was never migrated off the Obytes template:

1. The project instruction file (`claude.md`, lowercase) is 100% stock template
   content — no product, no process, no agent team, no merge policy. Fresh
   sessions start blind.
2. There is no shared `.claude/settings.json` and no hooks. Autonomous runs
   stall on permission prompts for `pnpm test` / `git commit`; the "no agent
   merges to main" rule exists only as prose.
3. The verification harness still tests the Obytes example app: Maestro flows
   assert "Obytes Starter" and feed posts; E2E targets `com.obytes.*` app IDs
   while the app builds `com.iapp.*`; CI E2E calls nonexistent
   `prebuild:staging` scripts; `app.config.ts` still points at the obytes Expo
   account and EAS project.
4. Pipeline state (task ledger, review verdicts, deviations) lives in the
   gitignored `.superpowers/sdd/` — lost when the machine or session dies. The
   feature branch has never been pushed, so CI has run zero times and the
   human-verification gate has no PR to attach to.
5. Agent definitions have gaps: no pointer to a durable ledger or process
   spec; reviewer's read-only rule is unenforced prose; ui-ux-designer claims
   design QA it cannot perform (it can't render screens); backend-developer
   references a `server/` that won't exist until M4.

## 2. Decisions (Product Owner, this session)

- **Scope:** all five gap areas as one package, "M1.5 — Agent Harness
  Hardening."
- **Sequencing:** start only after M1 Task 6/7 are committed and handed off;
  branch `feature/m1.5-agent-harness` off `feature/m1-foundation` (or off
  `main` if M1 has been merged by then).
- **EAS identity:** ~~no Expo account yet — placeholder everything~~
  **Superseded during M1.5 execution:** the PO created a real EAS project
  (commit `5b06a75` sets the project ID) and confirmed keeping
  `app.config.ts` untouched. NOTE: 5b06a75 set only
  the projectId — `owner: 'obytes'` and `slug: 'obytesapp'` are template
  leftovers that MUST be reconciled with the real Expo account at M5.
  Only the `com.obytes.*` app IDs in E2E/CI still get fixed to
  `com.iapp.*`.
- **Durable state:** committed repo ledger (not GitHub Issues).
- **Human gate:** push every feature branch + PR per feature with
  acceptance-criteria checklist; CI on every PR; PO merges on GitHub.
- **Approach:** process-as-repo-artifacts — everything versioned in this repo;
  no dependency on external plugins to reproduce the process.

## 3. Design

### 3.1 Knowledge layer

**`CLAUDE.md`** (renamed from lowercase `claude.md`, rewritten). Keeps the
useful template content (stack, commands, conventions) but leads with:

- What the product is: two sentences + pointer to
  `docs/specs/000-product-overview.md`.
- Process rules: spec before code, TDD, no merges to main, escalation paths.
- Where things live: `docs/specs/`, `docs/superpowers/plans/`,
  `docs/process/ledger.md`.
- Environment knowledge seeded from the M1 ledger: watchman flakiness
  (`jest --watchman=false`), pnpm-only enforcement, better-sqlite3 native
  build approval under pnpm.

The rename matters: on case-sensitive filesystems (Linux CI, cloud agents) a
lowercase `claude.md` may not be auto-loaded.

**`docs/specs/003-agent-process.md`** (new numbered spec). Single owner of the
SDD pipeline:

- Roles table (the six agents + PO).
- Dispatch loop: architect breaks down → developer implements on feature
  branch → reviewer verdicts → release-qa hand-off → PO merges.
- Hand-off note format.
- Ledger location and format (§3.4).
- Branch and PR conventions.

The design doc (`2026-07-13-routine-tracker-design.md` §6–8) gets a one-line
amendment pointing to 003 as the living version — this also retires the stale
`docs/plans/implementation-plan.md` path from §7. Spec 000's feature index
gains a row for 003.

### 3.2 Enforcement layer

**Committed `.claude/settings.json`** (project-shared; `settings.local.json`
remains personal and gitignored):

- **Allow:** `pnpm lint`, `pnpm lint:*`, `pnpm type-check`, `pnpm test`,
  `pnpm test:*`, `pnpm check-all`, `pnpm install`, `pnpm expo install`;
  read-only git (`status`, `diff`, `log`, `show`, `branch`); working git
  (`git add`, `git commit`, `git checkout -b feature/*`,
  `git push origin feature/*`); `gh pr create/view/checks`;
  `drizzle-kit generate`.
- **Deny:** `git push origin main`, `git merge`, rebase onto main,
  `git push --force*`, `rm -rf`, and Edit/Write under `android/` and `ios/`.
- Everything else falls through to the normal permission prompt. Deny beats
  allow when both match, so the merge policy wins.

**Hooks** (scripts in `.claude/hooks/`, wired in the same settings.json):

1. **PreToolUse guard `guard-main.sh`** on Bash: blocks any command that
   merges to, commits on, or pushes `main`; blocks writes to `android/` /
   `ios/` paths via Edit/Write. Catches subagents and cannot be skipped with
   `--no-verify`, unlike the husky hook.
2. **No PostToolUse auto-test hook** — deliberate. The agents' process (TDD +
   `pnpm check-all` before done) covers it; an on-every-edit type-check adds
   ~10s latency per edit for little gain. Revisit if review keeps catching
   type errors.

**Husky fix:** `.husky/post-merge` greps for `pnpm-lock.yml` but the file is
`pnpm-lock.yaml`, so auto-install-on-merge never fires. Fix the filename.
`pre-commit` stays as is.

### 3.3 Agent definition updates

Targeted edits to the six files in `.claude/agents/` — no rewrites:

- **All six:** add "Process spec: `docs/specs/003-agent-process.md`" and
  "Record progress/deviations in `docs/process/ledger.md`."
- **reviewer:** Bash is for verification commands only; any file mutation
  (including via `sed` / shell redirects) is a role violation. Verdicts go in
  the ledger.
- **ui-ux-designer:** scope design QA honestly — reviews code, specs, and
  screenshots provided to it; cannot render screens. Request screenshots from
  release-qa (Maestro can capture them) when code-reading isn't enough.
- **backend-developer:** note `server/` does not exist yet and is created at
  M4 per spec 020.
- **release-qa:** owns the PR-based hand-off (push branch, open PR with
  acceptance-criteria checklist) plus the app-identity/E2E config from §3.5.
- **feature-developer:** "escalate to architect" = ledger entry + stop, not
  just prose.
- No model-tier pins in frontmatter — they go stale; sessions inherit the
  running model.

### 3.4 Process durability & PR gate

- **Ledger:** `docs/process/ledger.md`, committed. Migrate the M1 entries from
  the gitignored `.superpowers/sdd/progress.md` so history isn't lost;
  `.superpowers/` stays gitignored as session scratch. Format: one line per
  task — status, commit range, review verdict, deviations.
- **Hand-off notes:** `docs/process/handoffs/`, one file per feature.
- **PR flow:** every feature branch is pushed; release-qa opens the PR.
  `.github/PULL_REQUEST_TEMPLATE.md` is rewritten to the hand-off format:
  spec link, acceptance criteria as checkboxes, what-to-test on device, known
  limitations. `feature/m1-foundation` is pushed and PR'd as the first use of
  the flow (after Task 7 finishes).
- **Branch protection** (one-time human step, documented as a checklist in
  spec 003): on `github.com/holybora/iApp`, protect `main` — require the
  test / type-check / lint checks, forbid direct pushes. Only the PO can
  perform this.

### 3.5 Verification harness cleanup

**App identity — one consistent set of values:**

- `app.config.ts`: LEAVE AS COMMITTED (decision superseded, see §2 — the
  EAS project is real; owner/slug/projectId stay as the PO set them).
- `package.json` `e2e-test`: `APP_ID=com.obytes.development` →
  `com.iapp.development`.
- CI E2E workflows: `com.obytes.staging` → `com.iapp.development`;
  `APP_ENV: staging` → `development` (`staging` exists in neither `env.ts`
  nor any `prebuild:*` / `build:*` script — these workflows could never run).

**Maestro:** delete the template flows (`create-post`, template `tabs`,
`login-with-validation`, "Obytes Starter" utils). Replace with exactly one
M1-level smoke flow: launch → assert four tabs (Today/Goals/Stats/Settings) →
tap through each. Golden-path flows arrive with M2/M3 features; writing them
now against placeholder screens is waste.

**CI policy:** test / type-check / lint on every PR stays as is (healthy).
E2E stays label-gated — an emulator boot per PR is too slow/flaky to require —
but the label now triggers a workflow that actually works. Add a
`coverageThreshold` to `jest.config.js`: measure global line/branch coverage
at implementation time and set each threshold to that value rounded down to
the nearest 5 points (a floor against regression, not an aspiration); CI then
fails on coverage drops instead of just commenting.

**Env:** add committed `.env.development.example` documenting the
`EXPO_PUBLIC_*` vars from `env.ts`, so strict-validation `prebuild` failures
on bare checkouts are self-explanatory.

**Out of scope (deliberate):** dependabot/CodeQL/security scanning — worth
doing, unrelated to agent autonomy; separate later chore.

## 4. Error handling

- Hook scripts fail closed: if `guard-main.sh` itself errors, the tool call is
  blocked, not allowed.
- Ledger migration preserves the original `.superpowers/sdd/progress.md`
  content verbatim under an "M1 (migrated)" heading — no rewriting of history.
- CI E2E remains opt-in, so a broken emulator job can never block the required
  checks.

## 5. Testing & acceptance

- **Hook tests:** plain-bash test script feeding `guard-main.sh`
  merge/push/edit commands, asserting block vs allow. Wired as
  `pnpm test:hooks` into CI's lint job (keeps Jest pure). Not part of
  `check-all`.
- **Maestro smoke flow:** optional before merge (flows were exercised
  during M1 device verification); mandatory at the M2 gate.
- **Package acceptance — a fresh Claude session in a clean checkout can:**
  1. State the product and process from `CLAUDE.md` alone.
  2. Run `pnpm check-all` and commit on a feature branch with zero permission
     prompts.
  3. Be blocked when attempting `git push origin main` or editing `ios/`.

## 6. Out of scope

- EAS build verification — the project now exists (see §2), but running
  and validating EAS builds stays out of M1.5; first exercised at M5.
- Product-feature Maestro flows — M2/M3 gates.
- Dependabot / CodeQL / dependency scanning.
- Skill-encoded dispatch pipeline (approach B) — may layer on later once the
  process is stable.
- Any product code under `src/` beyond what the smoke flow needs.
