# Claim Levels
Riverbraid uses claim levels to prevent overstatement.

| Level | Name | Meaning | Evidence Required |
|---|---|---|---|
| 0 | Published | Code or documentation is public. | Public repository or release artifact. |
| 1 | Local Verification | Verification passes on one local machine. | Local command output and clean worktree evidence. |
| 2 | Remote CI Verified | Verification passes in remote CI for the target commit. | CI run tied to exact commit. |
| 3 | Independent Reproduction | A third party can reproduce the same result without the author’s machine. | Locked environment, pinned commits, successful reproduction report. |
| 4 | Multi Environment Reproduction | Reproduction succeeds across multiple OS or architecture profiles. | Multiple independent reproduction reports. |
| 5 | External Audit | A qualified independent reviewer evaluates the system. | Published audit or signed attestation. |
| 6 | Production Profile Certification | A recognized body certifies a specific risk profile. | Certification report. |

## Current kit purpose
This kit targets Level 3. It does not claim Level 3 until an independent reviewer runs the kit and records a successful reproduction.

## What PASS does not mean
A pass does not mean:
- defect free
- production certified
- legally compliant
- sufficient for any specific risk profile
- independently audited
- safe in all deployment contexts

A pass only means the specified verification steps ran against the specified pinned commits and matched the expected result.
