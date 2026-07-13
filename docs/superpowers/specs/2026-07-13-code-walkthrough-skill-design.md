# Design: `code-walkthrough` Skill

**Date:** 2026-07-13
**Status:** Approved

## Purpose

A personal Claude Code skill that walks a student through code changes file by file, in the voice of a senior React Native developer teaching a complete beginner. The main goal: after a code agent implements something, the student can learn exactly what was built and why.

## Decisions Made

| Question | Decision |
|---|---|
| Format | Interactive chat lesson — pause after each file for questions |
| Audience | Complete beginner — first-principles explanations, no unexplained jargon |
| Scope selection | Always ask first — present a menu of uncommitted changes and recent commits |
| Active learning | Explain + occasional check-ins — one short, skippable comprehension question after key files |
| Structure | Option A: single self-contained `SKILL.md`, no reference files or scripts |
| Location | `~/.claude/skills/code-walkthrough/SKILL.md` (personal, project-agnostic) |

## Skill Definition

- **Name:** `code-walkthrough`
- **Invocation:** `/code-walkthrough` with an optional argument naming a commit, range (`HEAD~3..HEAD`), or branch.
- **Description triggers:** "explain what was changed", "walk me through the changes", "teach me what the agent did", "explain this commit like a teacher", or invoking after a code agent finishes an implementation.

## Behavior

### Phase 1 — Choose the lesson material

1. Survey what is reviewable: `git status` / `git diff --stat` for uncommitted changes, `git log --oneline -10` for recent commits.
2. Present a numbered menu (e.g., "1. Uncommitted changes (4 files), 2. Commit abc123 'Add login form' (6 files), …") and ask the student what to review. A commit range is always offered as an option.
3. If an argument was passed to the skill, skip the menu and use it directly.

### Phase 2 — Prepare the lesson plan

1. Read the full diff **and** the surrounding files for context before explaining anything.
2. Open with the big picture: one plain-English paragraph on what feature/fix was built and why.
3. Order files pedagogically, not alphabetically — dependency order so each file builds on concepts already explained:
   1. Types / schemas
   2. Data layer (API hooks, stores)
   3. UI components
   4. Routes / wiring / config
4. Show the plan as a short numbered list ("We'll look at 5 files in this order, here's why") before starting.

### Phase 3 — File-by-file teaching loop

For each file:

1. Explain what the file is *for* in the app, from first principles (e.g., what a "store" even is).
2. Walk through the changes hunk by hunk, quoting small code snippets and explaining line by line where needed.
3. Pause: "Any questions about this file before we move on?" and wait for the student.
4. After key files (typically ones introducing a new concept), ask one short comprehension question ("Why do you think we used Zustand here instead of useState?"). Explicitly skippable.

**Beginner rules baked into the skill:**

- Never use a term like "hook", "prop", "schema", or "mutation" without a one-sentence explanation the first time it appears.
- Always answer *why* the senior dev made this choice, not just *what* changed.
- Point out professional practices worth imitating: naming, file placement, error handling, testing.

### Phase 4 — Wrap-up

1. Recap the whole change as a story ("So to add login, we: defined the shape of the data → built the API hook → …").
2. List the concepts the student just learned.
3. Suggest one small modification the student could try themselves to cement the learning.

## Error Handling

- **Nothing to review** (clean tree, no meaningful commits): say so plainly and stop.
- **Huge diffs** (more than ~15 files): propose grouping files into chapters and walking through one chapter per session; let the student pick where to start.
- **Binary files, lockfiles, generated files:** mention in one line ("pnpm-lock.yaml updated automatically — nothing to learn here"), never walk through them.

## Testing

Validate by running the skill against a real change set — a small sample change in a project, or immediately after the next code-agent implementation — and confirm the flow hits all four phases: menu, lesson plan, per-file loop with pauses, wrap-up.

## Out of Scope

- Generated walkthrough documents (WALKTHROUGH.md / HTML output).
- Pre-written concept glossaries or reference files.
- Helper scripts; all git inspection uses ad-hoc one-liner commands.
- Full tutor mode (quiz after every file, final exam).
