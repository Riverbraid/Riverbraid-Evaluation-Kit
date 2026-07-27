#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../command-policy.sh
source "$ROOT_DIR/command-policy.sh"

unsupported_command='echo unsupported-command-must-not-run'

set +e
output="$(run_resolved_verify_command "$unsupported_command" 2>&1)"
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "FAIL: unsupported verifier command was accepted"
  exit 1
fi

if ! grep -Fq "FAIL_CLOSED: verifier command is not in the Evaluation Kit allowlist" <<<"$output"; then
  echo "FAIL: unsupported-command denial did not emit the required fail-closed reason"
  printf '%s\n' "$output"
  exit 1
fi

if ! grep -Fq "resolved_verify_command=$unsupported_command" <<<"$output"; then
  echo "FAIL: denied command identity was not preserved"
  printf '%s\n' "$output"
  exit 1
fi

echo "ALLOWLIST_NEGATIVE_TEST_PASS"
