#!/bin/bash

# Riverbraid Evaluation Kit command execution policy.
# This file is sourced by run-verification.sh and by bounded policy tests.
# It does not resolve repository commands or install dependencies.

run_resolved_verify_command() {
  local command="$1"

  case "$command" in
    "npm test")
      npm test
      ;;
    "npm run verify")
      npm run verify
      ;;
    "npm run test:riverbraid")
      npm run test:riverbraid
      ;;
    "npm run verify:feature-flow")
      npm run verify:feature-flow
      ;;
    "node verify.mjs")
      node verify.mjs
      ;;
    "node run-vectors.cjs verify")
      node run-vectors.cjs verify
      ;;
    "test -f README.md")
      test -f README.md
      ;;
    *)
      echo "FAIL_CLOSED: verifier command is not in the Evaluation Kit allowlist"
      echo "resolved_verify_command=$command"
      return 1
      ;;
  esac
}
