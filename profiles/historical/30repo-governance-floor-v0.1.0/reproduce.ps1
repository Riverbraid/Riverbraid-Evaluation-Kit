Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Write-Output "Riverbraid Evaluation Kit v0.1.0 governance floor"
Write-Output "Building Docker image..."
docker build -t riverbraid-evaluator .
Write-Output "Running Docker reproduction..."
docker run --rm riverbraid-evaluator
