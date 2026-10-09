#!/usr/bin/env bash
# Script to launch Claude Code routed through OmniRoute

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -f "$DIR/.env" ]; then
  # Export env variables from .env
  set -a
  source "$DIR/.env"
  set +a
fi

export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL:-http://localhost:20128}"
export ANTHROPIC_AUTH_TOKEN="${ANTHROPIC_AUTH_TOKEN:-omniroute-local}"
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-omniroute-local}"
export ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-auto}"

echo "Starting Claude Code via OmniRoute AI Gateway..."
echo "  ANTHROPIC_BASE_URL : $ANTHROPIC_BASE_URL"
echo "  ANTHROPIC_MODEL    : $ANTHROPIC_MODEL"
echo ""

if command -v claude >/dev/null 2>&1; then
  claude "$@"
else
  echo "claude command not found, using omniroute launch fallback..."
  npx omniroute launch "$@"
fi
