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

if printf '%s' "$cmd" | grep -qE 'git[^|;&]*\bpush\b[^|;&]*\bmain\b'; then
  block "push targeting main"
fi
if printf '%s' "$cmd" | grep -qE 'git[^|;&]*\bpush\b[^|;&]*(--force|--force-with-lease|-f)\b'; then
  block "force push"
fi
if printf '%s' "$cmd" | grep -qE 'git[^|;&]*\bmerge\b'; then
  block "git merge"
fi
if printf '%s' "$cmd" | grep -qE 'git[^|;&]*\bcommit\b'; then
  branch=$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null || echo '')
  if [ "$branch" = "main" ]; then block "commit while on main"; fi
fi
exit 0
