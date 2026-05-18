# Start Here: Riverbraid Evaluation
Riverbraid is a fail closed verification floor.
It does not certify AI systems. It separates proven state from unproven claims.
If you are looking for production certification, legal approval, or a guarantee that an AI system is safe, stop here. Riverbraid does not claim that.
If you need a reproducible, inspectable governance floor that shows exactly what can be verified right now, continue.

## Fifteen minute path
1. Read `ONE_PAGE_SYSTEM_MAP.md`.
2. Read `CLAIM_LEVELS.md`.
3. Read `EVALUATOR_DECISION_TREE.md`.
4. Run the containerized reproduction path:
    docker build -t riverbraid-evaluator .
    docker run --rm riverbraid-evaluator
5. Compare the emitted JSON with expected-results.json.

The kit is designed to fail closed. If a repository is unpinned, unavailable, dirty, missing a verifier, or produces a mismatched result, reproduction fails.
