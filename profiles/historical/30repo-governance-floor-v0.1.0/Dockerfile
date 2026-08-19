FROM node:20.11.0-bookworm-slim
RUN apt-get update \
    && apt-get install -y git jq ca-certificates --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /evaluator
COPY verified-repo-registry.json ./
COPY expected-results.json ./
COPY environment.lock.json ./
COPY run-verification.sh ./
RUN chmod +x run-verification.sh
CMD ["./run-verification.sh"]
