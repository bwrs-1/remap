#!/usr/bin/env bash
set -e

PORT=20128
BASE_URL="http://localhost:${PORT}"

echo "=========================================="
echo " OmniRoute Local Gateway Connectivity Test"
echo "=========================================="

# 1. Health check
echo -n "[1/3] Checking OmniRoute Server Health... "
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" || echo "000")
if [ "$HEALTH_CODE" = "200" ]; then
  echo "SUCCESS (HTTP $HEALTH_CODE)"
else
  echo "STATUS: HTTP $HEALTH_CODE (Server responded)"
fi

# 2. OpenAI-compatible /v1/chat/completions endpoint
echo "[2/3] Sending test request to ${BASE_URL}/v1/chat/completions (model: auto)..."
OPENAI_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}')

HTTP_STATUS=$(echo "$OPENAI_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$OPENAI_RESPONSE" | grep -v "HTTP_STATUS:")

echo "Response Status: HTTP ${HTTP_STATUS}"
echo "Response Body:"
echo "$BODY" | head -n 10

# 3. Anthropic-compatible /v1/messages endpoint (for Claude Code)
echo ""
echo "[3/3] Sending test request to ${BASE_URL}/v1/messages (model: auto)..."
ANTHROPIC_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/messages" \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"auto","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}')

A_HTTP_STATUS=$(echo "$ANTHROPIC_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
A_BODY=$(echo "$ANTHROPIC_RESPONSE" | grep -v "HTTP_STATUS:")

echo "Response Status: HTTP ${A_HTTP_STATUS}"
echo "Response Body:"
echo "$A_BODY" | head -n 10

echo ""
echo "=========================================="
echo " Connectivity Test Completed"
echo " OmniRoute Dashboard: ${BASE_URL}"
echo "=========================================="
