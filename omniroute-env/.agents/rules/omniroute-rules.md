---
description: OmniRoute gateway runtime and routing conventions
trigger: always_on
---

# OmniRoute Gateway Guidelines

- Port: 20128
- Local inference plane: `http://localhost:20128/v1`
- Start command: `npm run start:gateway`
- Claude launch: `npm run launch:claude` or `ANTHROPIC_BASE_URL=http://localhost:20128 ANTHROPIC_MODEL=auto claude`
