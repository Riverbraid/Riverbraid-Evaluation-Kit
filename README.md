# Riverbraid Evaluation Kit v0.1.0 governance floor

This kit supports independent reproduction of Riverbraid's verified governance floor. It is designed to fail closed.

## Verification paths

### Preferred: GitHub Actions, no local setup required

The canonical verification path runs in GitHub Actions on `ubuntu-latest`.

- Automatically triggered on pushes to `main` and pull requests into `main`
- Can be triggered manually from the Actions tab
- Does not require local Docker, PowerShell, WSL, or Windows setup
- Produces a verification summary artifact when the workflow runs

Manual path:

1. Open the **Actions** tab.
2. Select **Riverbraid Evaluation Kit Runtime**.
3. Select **Run workflow**.
4. Review the workflow logs and `verification-summary` artifact.

### Optional: local Docker

Use this path only when Docker is already working on the local machine.

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

Local Docker is optional. Do not install Docker as the first evaluation path.

## Current state

- Registry count: 30 entries
- Commit state: all pinned
- Claim level target: independent reproduction
- Certification claim: none
- Canonical runtime surface: GitHub Actions on `ubuntu-latest`

## What a PASS means

A PASS means:

- The pinned registry was cloned at exact commits.
- Each configured verification command executed and passed.
- The final summary matched `expected-results.json`.
- The kit ran in the declared verification surface.

## What a PASS does not mean

A PASS does not mean:

- Defect free
- Production certified
- Legally compliant
- Sufficient for any specific risk profile
- Externally audited
- Safe in all deployment contexts

A pass only means the specified verification steps ran against the specified pinned commits and matched the expected result.

## Non claims

This evaluation kit does not:

- Certify AI systems or models
- Provide legal approval or compliance certification
- Replace security review, legal review, or compliance audit
- Guarantee safety or suitability for production
- Make claims about downstream AI system behavior

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
| .gitattributes | Line ending control |
| .github/workflows/evaluation-kit-runtime.yml | GitHub Actions runtime verification |
