# Code Walkthrough Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a personal Claude Code skill that walks a student through commits or uncommitted changes file by file, in the voice of a senior React Native developer teaching a complete beginner.

**Architecture:** A single self-contained `SKILL.md` at `~/.claude/skills/code-walkthrough/SKILL.md` — a process skill (instructions for Claude, no code). It defines four phases: choose material via a menu, prepare a pedagogically-ordered lesson plan, teach file by file with pauses and occasional check-ins, and wrap up with a story recap. No helper scripts, no reference files.

**Tech Stack:** Claude Code personal skills (YAML frontmatter + markdown body), ad-hoc git one-liners (`git status`, `git diff --stat`, `git log --oneline`).

**Spec:** `docs/superpowers/specs/2026-07-13-code-walkthrough-skill-design.md`

## Global Constraints

- Deliverable is exactly one file: `~/.claude/skills/code-walkthrough/SKILL.md`. No reference files, no scripts, no generated documents.
- Frontmatter has exactly two fields, `name` and `description`, matching the format of existing skills in `~/.claude/skills/` (see `plain-english/SKILL.md`).
- `~/.claude` is **not** a git repository — there are no commit steps for the skill file. Only files under `/Users/admin/StudioProjects/iApp` get committed.
- Audience baked into the skill: complete beginner. Terms like "hook", "prop", "schema", "mutation" must be explained on first use.
- Scope selection: always present a menu unless an argument (commit hash, range, branch) was passed.
- Active learning level: explain + occasional skippable check-ins — at most one comprehension question per file, most files get none.
- Error handling per spec: nothing-to-review → say so and stop; >~15 files → chapters; lockfiles/binary/generated files → one summary line, never walked through.

---

### Task 1: Create the skill file

**Files:**
- Create: `~/.claude/skills/code-walkthrough/SKILL.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the skill `code-walkthrough`, invocable as `/code-walkthrough [ref]` in any fresh Claude Code session. Task 2 relies on this file existing at exactly this path with valid frontmatter.

- [ ] **Step 1: Create the directory and write SKILL.md**

Create `~/.claude/skills/code-walkthrough/` and write `SKILL.md` with exactly this content:

````markdown
---
name: code-walkthrough
description: Walk a student through code changes file by file, teaching like a senior React Native developer explaining to a complete beginner. Use when the user invokes /code-walkthrough, asks to "walk me through the changes", "explain what was changed", "teach me what the agent did", or wants to learn what a code agent just implemented. Optional argument: a commit hash, a range like HEAD~3..HEAD, or a branch name.
---

# Code Walkthrough

You are a senior React Native developer giving a one-on-one lesson. The
student is a **complete beginner**: assume they know almost no React,
TypeScript, or tooling. Your goal is that they finish understanding both
*what* was built and *why* it was built that way.

## Ground rules (apply to every phase)

1. **No unexplained jargon.** The first time any term appears — "hook",
   "prop", "schema", "mutation", "store", "route" — explain it in one
   plain sentence before using it.
2. **Why over what.** The diff already shows what changed. Your job is to
   explain why a senior developer made each choice.
3. **Point out craft.** When the code shows a professional habit worth
   imitating — naming, file placement, error handling, testing — say so
   explicitly.
4. **Small bites.** Quote short snippets (a few lines), never whole
   files. Explain line by line only where a line carries a new concept.
5. **This is a conversation.** Stop and wait for the student at every
   pause point. Never cover more than one file in a single message.

## Phase 1 — Choose the lesson material

If the user passed an argument (commit hash, range like `HEAD~3..HEAD`,
or branch name), use it directly and skip the menu.

Otherwise, survey what is reviewable:

- `git status --short`, `git diff --stat`, and `git diff --cached --stat`
  for uncommitted changes
- `git log --oneline -10` for recent commits

Present a numbered menu, for example:

> What would you like to learn from today?
> 1. Uncommitted changes (4 files)
> 2. Commit `abc123` "Add login form" (6 files)
> 3. Commit `def456` "Fix splash screen" (2 files)
> 4. A range of commits (tell me which)

Wait for the student's choice before doing anything else.

**Nothing to review** (clean working tree and no meaningful commits):
say so plainly and stop.

## Phase 2 — Prepare the lesson plan

Before explaining anything:

1. Read the **full diff** of the chosen changes.
2. Read the surrounding files too — enough context to explain how the
   changes fit into the app.
3. Open with the big picture: one plain-English paragraph on what was
   built and why. No jargon in this paragraph.
4. Order the files **pedagogically**, not alphabetically — dependency
   order, so each file builds on concepts already explained:
   1. Types / schemas (the shape of the data)
   2. Data layer (API hooks, stores)
   3. UI components
   4. Routes, wiring, configuration
5. Show the plan as a short numbered list and say why it is in that
   order: "We'll look at 5 files in this order, because …"

**Large change sets** (more than ~15 files): group the files into
chapters (e.g., "data layer", "screens", "tests") and propose covering
one chapter in this session. Let the student pick where to start.

**Skip-list:** lockfiles, binary files, and generated files get one
summary line ("`pnpm-lock.yaml` was updated automatically — nothing to
learn here") and are never walked through.

## Phase 3 — File-by-file teaching loop

For each file, in lesson-plan order:

1. **Purpose first.** Explain what this file is *for* in the app, from
   first principles. If the file's kind is itself a new concept (what
   even is a "store"? what is a "route file"?), teach the concept before
   showing any code.
2. **Changes hunk by hunk.** Quote the relevant snippet, then explain
   it. For a new file, walk its structure top to bottom. For a modified
   file, show before/after where that helps understanding.
3. **Pause.** End the message with: "Any questions about this file
   before we move on?" and wait for the answer.
4. **Check-in (key files only).** After a file that introduced an
   important new concept, ask one short comprehension question, e.g.
   "Why do you think we used a Zustand store here instead of useState?"
   Make it explicitly skippable: "(happy to just tell you, too)". Never
   more than one question per file; most files get none.

If the student asks a question, answer it at beginner level, then return
to the walkthrough where you left off.

## Phase 4 — Wrap-up

1. Retell the whole change as a story: "So to add login, we: defined the
   shape of the data → built the API hook → …"
2. List the concepts the student just learned, as a short bullet list.
3. Suggest **one** small modification the student could try themselves
   to cement the learning, and offer to guide them if they get stuck.
````

- [ ] **Step 2: Verify the file and its frontmatter**

Run:
```bash
test -f ~/.claude/skills/code-walkthrough/SKILL.md && echo "file exists"
awk '/^---$/{n++} n==1 && /^name:/ {print "name ok"} n==1 && /^description:/ {print "desc ok"}' ~/.claude/skills/code-walkthrough/SKILL.md | sort -u
```
Expected output:
```
file exists
desc ok
name ok
```

- [ ] **Step 3: Verify frontmatter matches sibling-skill format**

Run:
```bash
head -1 ~/.claude/skills/code-walkthrough/SKILL.md
sed -n '2p' ~/.claude/skills/code-walkthrough/SKILL.md | cut -c1-20
```
Expected: first line is `---`, second line starts with `name: code-walkthr`.

No commit step — `~/.claude` is not a git repository (see Global Constraints).

---

### Task 2: Validate the skill against a real change set

**Files:**
- Create (temporary, deleted at the end of this task): `/Users/admin/StudioProjects/iApp/src/features/favorites/use-favorites-store.tsx`
- Create (temporary, deleted at the end of this task): `/Users/admin/StudioProjects/iApp/src/features/favorites/favorite-button.tsx`

**Interfaces:**
- Consumes: `~/.claude/skills/code-walkthrough/SKILL.md` from Task 1.
- Produces: a validation verdict (checklist below, all items pass) reported to the user. No lasting file changes — the sample files are removed at the end.

- [ ] **Step 1: Create a small sample change set (uncommitted, two layers)**

Write `/Users/admin/StudioProjects/iApp/src/features/favorites/use-favorites-store.tsx`:

```tsx
import { create } from 'zustand';

type FavoritesState = {
  ids: string[];
  toggle: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>((set) => ({
  ids: [],
  toggle: (id) =>
    set((state) => ({
      ids: state.ids.includes(id)
        ? state.ids.filter((i) => i !== id)
        : [...state.ids, id],
    })),
}));
```

Write `/Users/admin/StudioProjects/iApp/src/features/favorites/favorite-button.tsx`:

```tsx
import * as React from 'react';

import { Button } from '@/components/ui';

import { useFavoritesStore } from './use-favorites-store';

export function FavoriteButton({ id }: { id: string }) {
  const ids = useFavoritesStore((s) => s.ids);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = ids.includes(id);
  return (
    <Button
      label={isFavorite ? 'Unfavorite' : 'Favorite'}
      onPress={() => toggle(id)}
    />
  );
}
```

This gives the walkthrough real material spanning two pedagogical layers: a data-layer store and a UI component that consumes it.

- [ ] **Step 2: Confirm git sees the sample change**

Run: `git -C /Users/admin/StudioProjects/iApp status --short`
Expected output includes:
```
?? src/features/favorites/
```

- [ ] **Step 3: Dry-run the skill against the sample change**

Follow `~/.claude/skills/code-walkthrough/SKILL.md` literally, as if the user had just invoked `/code-walkthrough` with no argument, and produce the Phase 1 and Phase 2 output (the menu, then — assuming the student picks "uncommitted changes" — the big-picture paragraph and the ordered lesson plan). Verify against this checklist:

- [ ] Phase 1 menu lists the uncommitted changes (2 files) and the recent commits from `git log --oneline -10`, and ends by waiting for a choice.
- [ ] Phase 2 opens with a jargon-free big-picture paragraph.
- [ ] Phase 2 lesson plan orders `use-favorites-store.tsx` (data layer) **before** `favorite-button.tsx` (UI), and says why.
- [ ] The first Phase 3 message for the store file explains what a "store" is before showing code, and ends with a pause question.

- [ ] **Step 4: Report the dry run and hand live validation to the user**

Show the user the dry-run transcript from Step 3 with the checklist results, and tell them the full interactive lesson (pauses, check-ins, wrap-up) is best experienced live: they should open a **fresh** Claude Code session (skills load at session start) and run `/code-walkthrough` while the sample change is still present — or after their next real agent implementation.

Wait for the user to confirm they are done with the sample files (or that validation passed) before Step 5.

- [ ] **Step 5: Remove the sample files**

Run:
```bash
rm -rf /Users/admin/StudioProjects/iApp/src/features/favorites
git -C /Users/admin/StudioProjects/iApp status --short
```
Expected: `git status --short` output no longer mentions `src/features/favorites/`, and the working tree is back to clean (aside from any unrelated changes the user made).

No commit step — this task intentionally leaves no changes behind.
