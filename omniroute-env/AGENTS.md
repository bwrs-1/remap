# OmniRoute Local AI Gateway Environment

## Project Overview
This workspace manages the local AI gateway **OmniRoute** and routes LLM requests for AI coding assistants such as Claude Code, Antigravity CLI (`agy`), and OpenAI-compatible tools.

## Gateway Specifications
- **Dashboard & API URL**: `http://localhost:20128`
- **OpenAI Compatible Endpoint**: `http://localhost:20128/v1` (e.g. `/v1/chat/completions`)
- **Anthropic Native Endpoint**: `http://localhost:20128/v1/messages`
- **Default Routing Model**: `auto` (routes to optimal/free tiers with auto-fallback)
- **Fallback Models**: `kimi-k3`, etc.

## Key Operational Commands
- Start Gateway Daemon: `npm run start:gateway` (or `npx omniroute serve --port 20128 --no-open --daemon`)
- Stop Gateway: `npm run stop:gateway` (or `npx omniroute stop`)
- Check Status: `npm run status:gateway` (or `npx omniroute status`)
- Check Health: `npm run health:gateway` (or `curl http://localhost:20128/health`)
- Run Connectivity Test: `npm run test:connection` (or `bash ./test-connection.sh`)
- Launch Claude Code: `npm run launch:claude` (or `./start-claude.sh`)

## Claude Code Routing Rules
When running Claude Code:
- Base URL is set to `http://localhost:20128` via `ANTHROPIC_BASE_URL` (Claude Code appends the API path automatically).
- Default model is `auto` via `ANTHROPIC_MODEL=auto`.
