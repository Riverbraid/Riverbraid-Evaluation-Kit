# Start Here: Riverbraid Evaluation

Riverbraid is a fail closed verification floor. It does not certify AI systems. It separates proven state from unproven claims.

Stop here if you are looking for production certification, legal approval, a guarantee that an AI system is safe, or external audit.

Continue if you need a reproducible, inspectable governance floor, a way to verify exactly what can be proven right now, or a foundation for internal governance workflows.

## Quick start: GitHub Actions

Recommended path. No local setup is required.

1. Open the Actions tab in this repository.
2. Select Riverbraid Evaluation Kit Runtime.
3. Select Run workflow.
4. Wait for completion.
5. Review the logs and verification summary.

## Read first path

1. Read ONE_PAGE_SYSTEM_MAP.md.
2. Read CLAIM_LEVELS.md.
3. Read EVALUATOR_DECISION_TREE.md.
4. Run the GitHub Actions workflow.
5. Compare the emitted JSON with expected-results.json.

## Optional local Docker path

Use this only when Docker is already working locally.

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

## Key rules

The kit is designed to fail closed:

- If a repository is unavailable, fail.
- If a commit is unpinned or mismatched, fail.
- If a verifier command fails, fail.
- If the output differs from expected, fail.

No partial or degraded result is treated as a pass.

## Non claims

This kit does not certify any AI system, provide legal approval, replace security or compliance review, guarantee safety, guarantee production readiness, or make claims about downstream AI behavior.
