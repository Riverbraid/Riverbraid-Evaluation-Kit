# One Page System Map
This file gives reviewers the shortest path into the Riverbraid structure.

| Layer | Repository or Surface | Role | Current Claim |
|---|---|---|---|
| Core authority | Riverbraid-Core | Normative protocol authority and release scope anchor | Verified only at its recorded claim level |
| Documentation surface | Riverbraid-Documentation | Public explanation, claim levels, inspection guides, non claims | Explanation surface, not a verifier |
| Verified registry | verified-repo-registry.json | Exact repositories selected for reproduction | Only valid when commits are pinned |
| Outer repositories | Other Riverbraid repositories | Documentation, support tooling, experiments, legacy, or future candidates | No inherited registry claim |

## Boundary rule
A repository only receives the claim level proven for that repository. No repository inherits a stronger claim from another repository by name, theme, or proximity.
