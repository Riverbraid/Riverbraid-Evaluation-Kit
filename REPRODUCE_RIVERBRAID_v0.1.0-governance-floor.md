# Reproduce Riverbraid v0.1.0 governance floor

Expected time: 15 to 30 minutes.

## Preferred path: GitHub Actions

Recommended for all users. No local tool installation is required.

1. Open the repository on GitHub.
2. Open the Actions tab.
3. Select Riverbraid Evaluation Kit Runtime.
4. Select Run workflow.
5. Wait for the workflow to complete.
6. Review the logs and the verification-summary artifact.

The workflow verifies required files, validates the 30 entry pinned registry, builds the Docker image on ubuntu-latest, runs the evaluator, and compares the output with expected-results.json.

## Optional path: local Docker

Use this only when Docker is already working on the local machine. Do not install Docker as the first step.

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

## Expected result

```json
{
  "riverbraid_reproduction": "PASS",
  "registry_checked": 30,
  "registry_passing": 30,
  "registry_failing": 0,
  "external_reproduction": true,
  "non_claims_preserved": true
}
```

Followed by:

```text
REPRODUCTION_MATCH
```

## Failure behavior

The script fails closed if any registry entry is unpinned, the registry count is not exactly 30, a clone fails, a checkout does not match the pinned commit, a verifier command fails, or the final summary differs from expected-results.json.

## What PASS means

A PASS means the selected registry was cloned at pinned commits, each configured verifier command passed, and the result matched the expected summary in the declared verification surface.

## What PASS does not mean

A PASS does not mean defect free, production ready, certified, externally audited, suitable for every risk profile, compliant with any regulation, or sufficient for deployment contexts.

This is a reproducible governance floor, not a certification.
