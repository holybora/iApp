#!/usr/bin/env bash
# PreToolUse guard (matcher: Edit|Write). Blocks file writes under android/
# and ios/ — native dirs are Expo-managed (CLAUDE.md rule). FAILS CLOSED.
set -uo pipefail
trap 'echo "guard-native-dirs: internal error — blocking by policy" >&2; exit 2' ERR

input=$(cat)
path=$(printf '%s' "$input" | python3 -c \
  'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' \
  2>/dev/null) || { echo "guard-native-dirs: unparseable tool input — blocked" >&2; exit 2; }

if printf '%s' "$path" | grep -qE '(^|/)(android|ios)/'; then
  echo "guard-native-dirs: BLOCKED — never edit android/ or ios/ directly; use Expo config plugins (CLAUDE.md)." >&2
  exit 2
fi
exit 0
