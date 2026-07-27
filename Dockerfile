FROM node:20.11.0-bookworm-slim@sha256:ecc9a2581f8588014a49a523a9ed146d27963f6d988d11bd16bbdcb3598f5f98
RUN apt-get update \
    && apt-get install -y git jq ca-certificates --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /evaluator
COPY verified-repo-registry.json ./
COPY expected-results.json ./
COPY environment.lock.json ./
COPY command-policy.sh ./
COPY run-verification.sh ./
RUN chmod +x run-verification.sh
CMD ["./run-verification.sh"]