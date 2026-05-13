#!/bin/bash
# Usage: ./claude-prompt.sh "refactor the auth service"
#        ./claude-prompt.sh "fix issue #42" claude-opus-4-7
# Each call starts an isolated container that is removed on exit.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
PROMPT="${1}"
MODEL="${2}"

if [ -z "$PROMPT" ]; then
    echo "Error: prompt argument is required." >&2
    echo "Usage: $0 \"your prompt here\" [model]" >&2
    exit 1
fi

ID="claude-$(date +%Y%m%d%H%M%S)-$RANDOM"
RUN_ARGS=(run --name "$ID" --env-file "$ENV_FILE" dev-env:latest claude -p "$PROMPT" --dangerously-skip-permissions)

if [ -n "$MODEL" ]; then
    RUN_ARGS+=(--model "$MODEL")
fi

echo "[$ID] starting (container kept after exit for inspection)"
docker "${RUN_ARGS[@]}"
echo "[$ID] done — inspect with: docker logs $ID | docker rm $ID"
