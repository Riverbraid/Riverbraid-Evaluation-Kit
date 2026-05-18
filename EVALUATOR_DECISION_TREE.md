# Evaluator Decision Tree

What are you looking for?

### Production certification
Stop. Riverbraid is not a certification authority.

### Reproducible governance floor
Continue. Riverbraid may be relevant if you need a way to separate proven state from unproven claims.

### Internal governance pilot
Continue. Riverbraid may be useful as a pilot evidence layer for claim separation and verification workflow design.

### AI vendor due diligence support
Proceed with caution. Riverbraid can support evidence review, but it does not replace security review, legal review, compliance review, or external audit.

### Safety critical deployment gate
Stop. Riverbraid alone is not sufficient for safety critical deployment.

## Reproduction path
    docker build -t riverbraid-evaluator .
    docker run --rm riverbraid-evaluator

Expected summary:
    {
      "riverbraid_reproduction": "PASS",
      "registry_checked": 30,
      "registry_passing": 30,
      "registry_failing": 0,
      "external_reproduction": true,
      "non_claims_preserved": true
}

If any output differs, the kit fails closed.
