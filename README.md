# Riverbraid Evaluation Kit v0.1.0 governance floor

This kit is a scaffold for independent reproduction of Riverbraid's verified governance floor.
It is designed to fail closed.

## Verification Paths

### Preferred: GitHub Actions (Canonical, No Local Setup Required)

The primary verification path runs on `ubuntu-latest` in GitHub Actions.

**Steps:**
1. Navigate to this repository's **Actions** tab
2. Select **Riverbraid Evaluation Kit Runtime**
3. Click **Run workflow** button
4. View the verification summary when complete

**What happens:**
- All 16 required files are verified present
- verified-repo-registry.json is validated: exactly 30 entries, all pinned, all valid commits
- Docker image is built from Dockerfile
- Docker container runs the full verification suite
- Each of 30 repositories is cloned at its pinned commit
- Each verification command runs
- Results are compared against expected-results.json
- Final JSON summary shows verification status

**Result:**
If all checks pass, the workflow emits:
```json
{
  "status": "GITHUB_ACTIONS_RUNTIME_VERIFICATION_PASS",
  "runtime_claim": "EXECUTED_IN_GITHUB_ACTIONS",
  "docker_claim": "VERIFIED_IN_GITHUB_ACTIONS",
  "verification_surface": "ubuntu-latest GitHub Actions",
  "local_windows_claim": "NOT_REQUIRED"
}
```

### Optional: Local Docker (Only If Docker Already Installed)

If Docker is already working on your machine, you may also reproduce locally:

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

**Important:** Do not install Docker as a first step. GitHub Actions is the canonical verification path.

## Current State

| Aspect | Status |
|--------|--------|
| Registry entries | 30 |
| Commit state | All pinned |
| Claim level target | Independent reproduction |
| Canonical verification surface | GitHub Actions on ubuntu-latest |
| Local Docker requirement | Optional |
| Windows Docker requirement | Not required |

## What a PASS Means

A PASS means:
- The pinned registry was successfully cloned at exact commits
- Each configured verification command executed and produced no errors
- The final summary matched `expected-results.json`
- Reproduction is deterministic and repeatable in the specified environment

## What a PASS Does NOT Mean

A PASS does **not** mean:
- The system is defect-free or bug-free
- The system is production-safe or deployment-ready
- The system is certified by any authority
- The system is externally audited or independently reviewed
- The system is suitable for any specific risk profile
- The system is compliant with any regulation or standard
- The system is safe in all deployment contexts
- Any claim about downstream AI system behavior

## Non-Claims

This evaluation kit explicitly does **not**:
- Certify AI systems or models
- Provide legal approval, compliance certification, or liability protection
- Replace security review, legal review, or compliance audit
- Guarantee safety, defect-freeness, or production readiness
- Make any claims about the behavior of systems that use this as a component
- Constitute an external audit or third-party assurance

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
| verified-repo-registry.json | Exact repository and commit registry (30 entries) |
| expected-results.json | Expected reproduction output |
| environment.lock.json | Tool and environment lock scaffold |
| Dockerfile | Containerized evaluation environment |
| run-verification.sh | Container verification runner |
| reproduce.ps1 | Windows helper script |
| reproduce.sh | Unix helper script |
| .gitattributes | Line ending normalization |
| .github/workflows/evaluation-kit-runtime.yml | GitHub Actions verification workflow |
