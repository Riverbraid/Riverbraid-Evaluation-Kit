#!/bin/bash
set -euo pipefail

echo "=== Riverbraid Evaluation Kit ==="

REGISTRY_FILE="/evaluator/verified-repo-registry.json"
EXPECTED_FILE="/evaluator/expected-results.json"
RESULTS_FILE="/tmp/riverbraid-actual-results.json"
WORK_ROOT="/tmp/riverbraid-evaluation-workspace"

rm -rf "$WORK_ROOT"
mkdir -p "$WORK_ROOT"

registry_count="$(jq 'length' "$REGISTRY_FILE")"
if [ "$registry_count" -ne 30 ]; then
  echo "FAIL: registry must contain exactly 30 entries. Found: $registry_count"
  exit 1
fi

unpinned_count="$(jq '[.[] | select(.commit == "UNPINNED" or .commit == "" or .commit == null)] | length' "$REGISTRY_FILE")"
if [ "$unpinned_count" -ne 0 ]; then
  echo "FAIL_CLOSED: registry contains unpinned commits."
  jq -r '.[] | select(.commit == "UNPINNED" or .commit == "" or .commit == null) | .name' "$REGISTRY_FILE"
  exit 1
fi

resolve_verify_command() {
  local configured="$1"

  if [ "$configured" != "npm test" ]; then
    printf '%s\n' "$configured"
    return 0
  fi

  if [ -f package.json ] && jq -e '.scripts.test? // empty' package.json >/dev/null 2>&1; then
    printf '%s\n' "npm test"
    return 0
  fi

  if [ -f package.json ] && jq -e '.scripts.verify? // empty' package.json >/dev/null 2>&1; then
    printf '%s\n' "npm run verify"
    return 0
  fi

  if [ -f verify.mjs ]; then
    printf '%s\n' "node verify.mjs"
    return 0
  fi

  if [ -f run-vectors.cjs ]; then
    printf '%s\n' "node run-vectors.cjs verify"
    return 0
  fi

  return 1
}

TOTAL=0
PASS=0
FAIL=0

while IFS= read -r entry; do
  name="$(echo "$entry" | jq -r '.name')"
  url="$(echo "$entry" | jq -r '.url')"
  commit="$(echo "$entry" | jq -r '.commit')"
  verify_command="$(echo "$entry" | jq -r '.verify_command')"

  echo "--- Processing $name ---"

  repo_dir="$WORK_ROOT/$name"
  if ! git clone --quiet "$url" "$repo_dir"; then
    echo "FAIL: clone failed for $name"
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  cd "$repo_dir"

  if ! git checkout --quiet "$commit"; then
    echo "FAIL: checkout failed for $name at $commit"
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  actual_commit="$(git rev-parse HEAD)"
  if [ "$actual_commit" != "$commit" ]; then
    echo "FAIL: commit mismatch for $name"
    echo "expected=$commit"
    echo "actual=$actual_commit"
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  if ! resolved_verify_command="$(resolve_verify_command "$verify_command")"; then
    echo "FAIL_CLOSED: no executable verifier command resolved for $name"
    echo "configured_verify_command=$verify_command"
    FAIL=$((FAIL + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  echo "resolved_verify_command=$resolved_verify_command"

  if [ -f package-lock.json ]; then
    npm ci --silent
  elif [ -f package.json ] && [[ "$resolved_verify_command" == npm* ]]; then
    npm install --package-lock-only --ignore-scripts --silent
    npm ci --silent
  fi

  if bash -lc "$resolved_verify_command"; then
    PASS=$((PASS + 1))
  else
    echo "FAIL: verifier failed for $name"
    FAIL=$((FAIL + 1))
  fi

  TOTAL=$((TOTAL + 1))
done < <(jq -c '.[]' "$REGISTRY_FILE")

jq -n \
  --argjson checked "$TOTAL" \
  --argjson passing "$PASS" \
  --argjson failing "$FAIL" \
  '{
    riverbraid_reproduction: (if $failing == 0 then "PASS" else "FAIL" end),
    registry_checked: $checked,
    registry_passing: $passing,
    registry_failing: $failing,
    external_reproduction: ($failing == 0),
    non_claims_preserved: true
  }' > "$RESULTS_FILE"

echo "=== Actual Result ==="
jq -S . "$RESULTS_FILE"

echo "=== Expected Result ==="
jq -S . "$EXPECTED_FILE"

if diff -u <(jq -S . "$EXPECTED_FILE") <(jq -S . "$RESULTS_FILE"); then
  echo "REPRODUCTION_MATCH"
else
  echo "FAIL_CLOSED: reproduction output differs from expected result."
  exit 1
fi
