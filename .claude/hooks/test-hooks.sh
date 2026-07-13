#!/usr/bin/env bash
# Tests for the PreToolUse guard hooks. Asserts block (exit 2) vs allow (exit 0).
set -u
cd "$(git rev-parse --show-toplevel)"
MAIN_HOOK=".claude/hooks/guard-main.sh"
DIRS_HOOK=".claude/hooks/guard-native-dirs.sh"
pass=0; fail=0

run_bash_hook() {
  printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$1" \
    | bash "$MAIN_HOOK" >/dev/null 2>&1
  echo $?
}
run_file_hook() {
  printf '{"tool_name":"Write","tool_input":{"file_path":"%s"}}' "$1" \
    | bash "$DIRS_HOOK" >/dev/null 2>&1
  echo $?
}
check() { # $1 expected exit, $2 actual exit, $3 label
  if [ "$1" = "$2" ]; then pass=$((pass+1));
  else fail=$((fail+1)); echo "FAIL: $3 (expected exit $1, got $2)"; fi
}

# temp repos make branch-dependent cases deterministic on any checkout
tmp_main=$(mktemp -d); git -C "$tmp_main" init -q -b main; git -C "$tmp_main" commit --allow-empty -qm init
tmp_feat=$(mktemp -d); git -C "$tmp_feat" init -q -b feature/x; git -C "$tmp_feat" commit --allow-empty -qm init
run_bash_hook_in() { # $1 = CLAUDE_PROJECT_DIR to simulate, $2 = command
  printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$2" \
    | CLAUDE_PROJECT_DIR="$1" bash "$MAIN_HOOK" >/dev/null 2>&1
  echo $?
}

# guard-main.sh — must BLOCK (text-based, any branch)
check 2 "$(run_bash_hook 'git push origin main')" "push main"
check 2 "$(run_bash_hook 'git push -u origin main')" "push -u main"
check 2 "$(run_bash_hook 'git push --force origin feature/x')" "force push"
check 2 "$(run_bash_hook 'git push -f')" "force push short"
check 2 "$(run_bash_hook 'git merge feature/x')" "merge"
check 2 "$(run_bash_hook 'cd /tmp && git merge x')" "merge in compound command"
check 2 "$(printf 'not json' | bash "$MAIN_HOOK" >/dev/null 2>&1; echo $?)" "fail closed on bad input"

# guard-main.sh — must BLOCK (branch-state-based)
check 2 "$(run_bash_hook_in "$tmp_main" 'git push')" "bare push while on main"
check 2 "$(run_bash_hook_in "$tmp_main" 'git commit -m msg')" "commit while on main"

# guard-main.sh — must ALLOW
check 0 "$(run_bash_hook 'pnpm check-all')" "check-all"
check 0 "$(run_bash_hook 'echo main')" "echo main"
check 0 "$(run_bash_hook 'git log main..HEAD')" "read-only git mentioning main"
check 0 "$(run_bash_hook 'git merge-base main HEAD')" "merge-base is read-only"
check 0 "$(run_bash_hook_in "$tmp_feat" 'git push origin feature/m1.5-agent-harness')" "push feature branch"
check 0 "$(run_bash_hook_in "$tmp_feat" 'git push')" "bare push on feature branch"
check 0 "$(run_bash_hook_in "$tmp_feat" 'git commit -m msg')" "commit on feature branch"
check 0 "$(run_bash_hook_in "$tmp_feat" 'git commit -m docs-fix-push-main-note')" "commit message mentioning push/main"

rm -rf "$tmp_main" "$tmp_feat"

# guard-native-dirs.sh — must BLOCK
check 2 "$(run_file_hook 'android/app/build.gradle')" "write android/"
check 2 "$(run_file_hook 'ios/Podfile')" "write ios/"
check 2 "$(run_file_hook '/Users/x/repo/android/settings.gradle')" "absolute android path"

# guard-native-dirs.sh — must ALLOW
check 0 "$(run_file_hook 'src/features/today/today-screen.tsx')" "write src/"
check 0 "$(run_file_hook 'docs/specs/003-agent-process.md')" "write docs/"
check 0 "$(run_file_hook 'src/lib/biosensors.ts')" "path containing 'ios' substring"

echo "hooks: $pass passed, $fail failed"
[ "$fail" = "0" ]
