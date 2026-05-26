# Start Here: Riverbraid Evaluation

Riverbraid is a fail closed verification floor.

It does not certify AI systems. It separates proven state from unproven claims.

If you are looking for production certification, legal approval, or a guarantee that an AI system is safe, stop here. Riverbraid does not claim that.

If you need a reproducible, inspectable governance floor that shows exactly what can be verified right now, continue.

## Fifteen minute path

1. Read `ONE_PAGE_SYSTEM_MAP.md`.
2. Read `CLAIM_LEVELS.md`.
3. Read `EVALUATOR_DECISION_TREE.md`.
4. Open this repository's **Actions** tab.
5. Run the **Riverbraid Evaluation Kit Runtime** workflow.
6. Review the emitted workflow output and artifacts.
7. Compare the result with `expected-results.json`.

## Optional local Docker path

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

The kit is designed to fail closed. If a repository is unpinned, unavailable, dirty, missing a verifier, or produces a mismatched result, reproduction fails.

## Boundary

GitHub Actions is the canonical first path for public evaluation. Local Docker remains an optional reproduction path for users who want to run the kit locally.
