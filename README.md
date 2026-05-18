# Riverbraid Evaluation Kit v0.1.0 governance floor

This kit is a scaffold for independent reproduction of Riverbraid's verified governance floor.
It is designed to fail closed.

## Verification Paths

### Preferred: GitHub Actions (No Local Setup Required)
The canonical verification path runs in GitHub Actions on ubuntu-latest:
- Automatically triggered on push to main and pull requests
- No local Docker installation required
- View results: GitHub Actions > Riverbraid Evaluation Kit Runtime tab
- Manual trigger: Actions tab > Riverbraid Evaluation Kit Runtime > Run workflow

### Optional: Local Docker (Requires Docker Already Installed)
If Docker is already working on your machine:
```bash
docker build -t riverbraid-evaluator .
docker run --rm riverbraid-evaluator
