#!/bin/bash
set -euo pipefail
echo "Riverbraid Evaluation Kit v0.1.0 governance floor"
echo "Building Docker image..."
docker build -t riverbraid-evaluator .
echo "Running Docker reproduction..."
docker run --rm riverbraid-evaluator
