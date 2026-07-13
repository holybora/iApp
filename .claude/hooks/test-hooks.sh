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

# guard-main.sh — must BLOCK
check 2 "$(run_bash_hook 'git push origin main')" "push main"
check 2 "$(run_bash_hook 'git push -u origin main')" "push -u main"
check 2 "$(run_bash_hook 'git push --force origin feature/x')" "force push"
check 2 "$(run_bash_hook 'git push -f')" "force push short"
check 2 "$(run_bash_hook 'git merge feature/x')" "merge"
check 2 "$(run_bash_hook 'cd /tmp && git merge x')" "merge in compound command"
check 2 "$(printf 'not json' | bash "$MAIN_HOOK" >/dev/null 2>&1; echo $?)" "fail closed on bad input"

# guard-main.sh — must ALLOW
check 0 "$(run_bash_hook 'git push origin feature/m1.5-agent-harness')" "push feature branch"
check 0 "$(run_bash_hook 'pnpm check-all')" "check-all"
check 0 "$(run_bash_hook 'echo main')" "echo main"
check 0 "$(run_bash_hook 'git log main..HEAD')" "read-only git mentioning main"
if [ "$(git branch --show-current)" != "main" ]; then
  check 0 "$(run_bash_hook 'git commit -m msg')" "commit on feature branch"
fi

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
