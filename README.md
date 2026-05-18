# Riverbraid Evaluation Kit v0.1.0 governance floor
This kit is a scaffold for independent reproduction of Riverbraid's verified governance floor.
It is designed to fail closed.

## Current state
This repository is not reproducible until every entry in `verified-repo-registry.json` has an exact pinned commit SHA.
Current scaffold state:
- Registry count target: 30
- Commit state: UNPINNED
- Expected first run: FAIL_CLOSED_UNPINNED_COMMITS
- Claim level target: Independent reproduction
- Certification claim: none

## Quick path after commits are pinned
    docker build -t riverbraid-evaluator .
    docker run --rm riverbraid-evaluator

## What a PASS means
A PASS means the selected repositories were cloned at pinned commits, their configured verification commands ran, and the final summary matched `expected-results.json`.

## What a PASS does not mean
A PASS does not mean the system is defect free, certified, legally compliant, production safe, or sufficient for every risk profile.

## Files
| File | Purpose |
|---|---|
| README.md | Root repository entrance and setup map |
| START_HERE.md | First evaluator entry point |
| ONE_PAGE_SYSTEM_MAP.md | Short architecture map |
| CLAIM_LEVELS.md | Claim ladder and evidence rules |
| EVALUATOR_DECISION_TREE.md | Fit check before evaluation |
| RISK_PROFILE_MATRIX.md | Risk profile boundary guide |
| MATURITY_LADDER.md | Current maturity framing |
| REPRODUCE_RIVERBRAID_v0.1.0-governance-floor.md | Reproduction guide |
| verified-repo-registry.json | Exact repository and commit registry |
| expected-results.json | Expected reproduction output |
| environment.lock.json | Tool and environment lock scaffold |
| Dockerfile | Containerized evaluation environment |
| run-verification.sh | Container verification runner |
| reproduce.ps1 | Windows helper |
| reproduce.sh | Unix helper |
