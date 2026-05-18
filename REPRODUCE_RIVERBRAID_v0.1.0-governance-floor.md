# Reproduce Riverbraid v0.1.0 governance floor

Expected time: 15 to 30 minutes

## Preferred Path: GitHub Actions (Recommended for All Users)

**No local setup required.** This is the canonical verification path.

### Steps

1. Go to the repository's **Actions** tab: https://github.com/Riverbraid/Riverbraid-Evaluation-Kit/actions
2. Select **Riverbraid Evaluation Kit Runtime** from the workflow list
3. Click the **Run workflow** button
4. Select `main` branch (should be default)
5. Click **Run workflow**
6. Wait for the workflow to complete (typically 10-30 minutes)
7. View the final verification summary in the workflow run output

### What the Workflow Does

1. Verifies all 16 required files exist
2. Validates verified-repo-registry.json:
   - Exactly 30 entries
   - All commits pinned (no UNPINNED, empty, or null values)
   - All commits in valid 40-character lowercase hexadecimal format
3. Builds the Docker image
4. Runs the verification container, which:
   - Clones each of the 30 repositories at their pinned commits
   - Runs the configured verification command for each repository
   - Compares the final summary against expected-results.json
5. Emits a JSON verification summary

### Expected Result

The workflow will print:
```json
{
  "status": "GITHUB_ACTIONS_RUNTIME_VERIFICATION_PASS",
  "runtime_claim": "EXECUTED_IN_GITHUB_ACTIONS",
  "docker_claim": "VERIFIED_IN_GITHUB_ACTIONS",
  "verification_surface": "ubuntu-latest GitHub Actions",
  "local_windows_claim": "NOT_REQUIRED"
}
```

Followed by:
```
REPRODUCTION_MATCH
```

## Alternative Path: Local Docker (Optional, Only If Docker Already Installed)

**Only attempt this if Docker is already working on your machine.** Do not install Docker as your first step.

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

## Failure Behavior

The verification fails closed (stops with exit code 1) if:
- Any required file is missing
- Registry count is not exactly 30
- Any registry entry has an unpinned, null, or empty commit
- Any registry entry has a malformed commit (not 40-char lowercase hex)
- Any clone operation fails
- Any checkout to a pinned commit fails
- Any verifier command fails
- The final summary differs from expected-results.json

If verification fails, the workflow output will show:
- Which step failed
- Why it failed
- Diagnostic information to help diagnose the issue

## What PASS Means

A PASS means:
- The exact selected registry (30 repositories at pinned commits) was successfully cloned
- Each configured verifier command passed
- The result matched the expected summary
- The verification is reproducible and deterministic

## What PASS Does NOT Mean

A PASS does **not** mean:
- Defect-free or bug-free code
- Production-safe or deployment-ready code
- Certified by any authority or standard
- Externally audited or independently verified
- Suitable for any specific risk profile
- Compliant with any regulation or standard
- Safe in all deployment contexts
- Any claim about downstream system behavior

## Non-Claims

This reproduction kit does **not**:
- Certify AI systems or models
- Provide legal approval or compliance certification
- Replace security review, legal review, or compliance audit
- Guarantee safety or production readiness
- Make any claims about the behavior of systems that use this as a component
- Constitute an external audit or third-party assurance

This is a reproducible governance floor, not a certification.
