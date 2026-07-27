# Riverbraid Evaluation Kit v0.1.0 governance floor

This kit is a scaffold for independent reproduction of Riverbraid's declared governance floor.
It is designed to fail closed.

## Role in Riverbraid

Riverbraid-Evaluation-Kit is the current public entry and evaluation surface for Riverbraid.

## Public verification boundary

This repository defines the current public pinned verification registry and reproduction path for Riverbraid's governance floor.

`claim-ceiling.json` is the machine-readable declaration of what the exact profile may and may not claim. It defines the required command-policy test contract but does not self-certify the latest workflow result; consult the workflow or PR evidence for the exact commit being assessed.

## Evidence boundary

This repository does not claim certification, legal approval, production readiness, absolute security, external audit, complete AI safety, adoption, or absence of defects.

Current controls and limitations:

- verifier execution is constrained by `command-policy.sh`;
- `tests/command-policy-negative.sh` requires an unsupported command to fail closed and emit an attributable reason;
- CI must execute that negative test before building and running the Evaluation Kit container;
- the latest result for an exact commit belongs in the corresponding workflow or evidence record;
- a disposition on package lifecycle scripts and dependency-install behavior remains required;
- the Docker base-image digest remains unpinned;
- registry freshness remains locked pending succession evidence and authority;
- verification depth is nonuniform, including presence-check-only entries.

These conditions are enumerated in `claim-ceiling.json` and tracked in issues #8 through #11.

## Verification Paths

### Preferred public path: GitHub Actions

The intended primary verification path runs on GitHub Actions.

**Steps:**

1. Navigate to this repository's **Actions** tab.
2. Select **Riverbraid Evaluation Kit Runtime**.
3. Run the workflow.
4. Inspect the exact workflow result, component results, logs, source identities, and limitations.

**What the workflow is designed to do:**

- verify the required Evaluation Kit files are present;
- validate that `verified-repo-registry.json` has exactly 30 pinned entries;
- execute the unsupported-command fail-closed policy test;
- build the declared Dockerfile;
- run the verification suite in the resulting container;
- clone each registered repository at its pinned commit;
- execute each configured bounded verification command;
- compare results against `expected-results.json`;
- emit a final JSON summary.

**Evidence rule:**

The workflow definition and test-file presence are not proof that a run succeeded. A runtime claim requires an attributable workflow run or preserved local execution packet for the exact commit being assessed.

### Optional: Local Docker

If Docker is already working on the operator's machine, the declared container path may be attempted:

```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
```

Do not describe this path as immutable, hermetic, or fully reproducible while `environment.lock.json` records the base image digest as `UNPINNED`.

## Current State

| Aspect | Status |
|---|---|
| Registry entries | 30 |
| Registry commit state | Pinned snapshot |
| Registry freshness | Locked / not automatically current with default branches |
| Command-dispatch hardening | Shared allowlist policy plus required unsupported-command negative test |
| Latest policy-test execution | External to this README; consult the exact workflow or PR record |
| Lifecycle-script policy | Unresolved |
| Verification depth | Nonuniform; classified separately |
| Docker base image | Tag pinned / digest unpinned |
| Public execution surface | GitHub Actions |
| Local Docker | Optional |
| Independent reproduction | Not established by repository ownership or self-execution |

## What a successful run means

A successful exact run may establish only that:

- the required policy tests passed for that exact source state;
- the pinned registry commits were acquired for that run;
- each configured command exited successfully under the observed runner and environment;
- the recorded outputs matched the expected-result contract used by that run;
- the resulting evidence remains attributable to the exact source, evaluator, configuration, and environment.

The interpretation must preserve each command's declared verification depth. A presence check remains a presence check. An `npm test` result is only as strong as the package script and verifier it invokes.

## What a successful run does NOT mean

A successful run does **not** mean:

- the system is defect-free or bug-free;
- the system is production-safe or deployment-ready;
- the system is certified by any authority;
- the system is externally audited or independently reviewed;
- the system is suitable for any specific risk profile;
- the system complies with any regulation or standard;
- the system is safe in all deployment contexts;
- the registry is automatically fresh relative to current default branches;
- all 30 entries have equal behavioral verification depth;
- all 52 public Riverbraid repositories were evaluated;
- the F3/F4 functional core has been selected or proven;
- an independent operator reproduced the profile;
- package lifecycle-script risk has been resolved;
- downstream AI system behavior is assured.

## Non-Claims

This Evaluation Kit explicitly does **not**:

- certify AI systems or models;
- provide legal approval, compliance certification, or liability protection;
- replace security review, legal review, or compliance audit;
- guarantee safety, defect-freeness, or production readiness;
- make claims about the behavior of systems that use this as a component;
- constitute an external audit or third-party assurance;
- convert registry membership into equal verification depth;
- convert file presence into behavioral verification;
- convert one successful run into proof of future unchanged behavior.

## Files

| File | Purpose |
|---|---|
| `README.md` | Root repository entrance and bounded setup map |
| `START_HERE.md` | First evaluator entry point |
| `ONE_PAGE_SYSTEM_MAP.md` | Short architecture map |
| `CLAIM_LEVELS.md` | Claim ladder and evidence rules |
| `claim-ceiling.json` | Machine-readable allowed claims, refused claims, test contract, and current limitations |
| `EVALUATOR_DECISION_TREE.md` | Fit check before evaluation |
| `RISK_PROFILE_MATRIX.md` | Risk-profile boundary guide |
| `MATURITY_LADDER.md` | Current maturity framing |
| `REPRODUCE_RIVERBRAID_v0.1.0-governance-floor.md` | Reproduction guide |
| `verified-repo-registry.json` | Exact repository and commit registry with 30 entries |
| `expected-results.json` | Expected reproduction output contract |
| `environment.lock.json` | Tool and environment lock scaffold |
| `command-policy.sh` | Shared allowlisted command-execution policy |
| `tests/command-policy-negative.sh` | Unsupported-command fail-closed test |
| `Dockerfile` | Containerized evaluation environment |
| `run-verification.sh` | Container verification runner |
| `reproduce.ps1` | Windows helper script |
| `reproduce.sh` | Unix helper script |
| `.gitattributes` | Line-ending normalization |
| `.github/workflows/evaluation-kit-runtime.yml` | GitHub Actions verification workflow |
