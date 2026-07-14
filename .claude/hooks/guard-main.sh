#!/usr/bin/env bash
# PreToolUse guard (matcher: Bash). Blocks merges to, commits on, and pushes
# of main. Exit 2 = block (stderr shown to the agent). FAILS CLOSED.
set -uo pipefail
trap 'echo "guard-main: internal error — blocking by policy" >&2; exit 2' ERR

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c \
  'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' \
  2>/dev/null) || { echo "guard-main: unparseable tool input — blocked" >&2; exit 2; }

block() { echo "guard-main: BLOCKED — $1. Merging/pushing main is a human action (docs/specs/003-agent-process.md)." >&2; exit 2; }

# GIT anchors the verb as git's actual SUBCOMMAND (allowing -C/-c/--flag
# options in between). A loose match like git[^|;&]*push would also hit
# quoted text, e.g. git commit -m "docs: fix push main" — a real false
# positive found while dogfooding.
GIT='\bgit(\s+-C\s+\S+|\s+-c\s+\S+|\s+--[A-Za-z-]+(=\S+)?)*\s+'

if printf '%s' "$cmd" | grep -qE "${GIT}push\b[^|;&]*\bmain\b"; then
  block "push targeting main"
fi
if printf '%s' "$cmd" | grep -qE "${GIT}push\b[^|;&]*(--force(-with-lease)?|-f)\b"; then
  block "force push"
fi
# merge(\s|$) not \bmerge\b: `git merge-base` is read-only and must pass
if printf '%s' "$cmd" | grep -qE "${GIT}merge(\s|\$)"; then
  block "git merge"
fi
current_branch() { git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null || echo ''; }
if printf '%s' "$cmd" | grep -qE "${GIT}commit\b"; then
  if [ "$(current_branch)" = "main" ]; then block "commit while on main"; fi
fi
# a bare `git push` while checked out on main pushes main without the
# literal word appearing in the command — catch it by branch state
if printf '%s' "$cmd" | grep -qE "${GIT}push\b"; then
  if [ "$(current_branch)" = "main" ]; then block "push while on main — check out a feature branch"; fi
fi
exit 0
