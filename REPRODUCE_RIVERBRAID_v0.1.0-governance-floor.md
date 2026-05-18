# Reproduce Riverbraid v0.1.0 governance floor
Expected time: 15 to 30 minutes
Required host tool: Docker

## Command
    docker build -t riverbraid-evaluator .
    docker run --rm riverbraid-evaluator

## Expected result
    {
      "riverbraid_reproduction": "PASS",
      "registry_checked": 30,
      "registry_passing": 30,
      "registry_failing": 0,
      "external_reproduction": true,
      "non_claims_preserved": true
    }

## Failure behavior
The script fails closed if:
- any registry entry is unpinned
- any clone fails
- any checkout target does not match the pinned commit
- any verifier command fails
- the final summary differs from expected-results.json

## What PASS means
- The exact selected registry was cloned at pinned commits.
- Each configured verifier command passed.
- The result matched the expected summary.

## What PASS does not mean
- defect free
- production safe
- certified
- externally audited
- suitable for every risk profile

This is a reproducible governance floor, not a certification.
