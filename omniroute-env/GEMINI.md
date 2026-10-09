# OmniRoute Workspace Guidelines (Antigravity & Gemini)

## Workspace Role
This directory (`omniroute-env`) provides the configuration and runtime management for OmniRoute, serving as a unified local AI gateway for Claude Code and other development agents.

## Endpoints
- Base: `http://localhost:20128`
- OpenAI API: `http://localhost:20128/v1`
- Anthropic API: `http://localhost:20128/v1`

## Operational Guidelines
- Always verify the gateway status using `npm run status:gateway` before starting work.
- If OmniRoute is not running, start it using `npm run start:gateway`.
- Claude Code should be launched with `ANTHROPIC_BASE_URL=http://localhost:20128` and `ANTHROPIC_MODEL=auto`.
