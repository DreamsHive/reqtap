# Reqtap

> **Tap into your webhooks.** Self-hostable webhook inspector & relay — capture, inspect, replay, and forward webhooks to your localhost. `webhook.site` + `smee.io` in one box.

[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1.svg)](LICENSE)

## Why

Debugging webhooks today means juggling separate tools: one to inspect payloads, another to tunnel them to localhost, and nothing to replay them. Reqtap combines all three — fully open source and self-hostable.

|  | Inspect | Forward to localhost | Replay | Self-host |
|---|---|---|---|---|
| webhook.site (OSS) | ✅ | ❌ | ❌ | ⚠️ heavy |
| smee.io | ❌ | ✅ | ❌ | ✅ |
| Hookdeck / Svix | ✅ | ✅ | ✅ | ❌ paid SaaS |
| **Reqtap** | ✅ | ✅ | ✅ | ✅ one command |

## Quick start

```bash
# self-host (app + mongo)
git clone https://github.com/DreamsHive/reqtap
cd reqtap && cp .env.example .env
docker compose up -d

# forward live webhooks to your dev server
npx @reqtap/cli forward <token> --to localhost:3000
```

## Monorepo layout

```
apps/
  server/    # AdonisJS v6 — ingest, REST API, WebSocket, replay engine
  web/       # Nuxt 3 + Nuxt UI — real-time dashboard
packages/
  cli/       # `wh` — relay CLI (npx @reqtap/cli)
  shared/    # shared TypeScript types
```

## Development

```bash
bun install
docker compose up -d mongo   # local MongoDB
bun dev                     # server + web in parallel
```

| Command | Description |
|---|---|
| `bun dev` | Run server & web in parallel |
| `bun run build` | Build all workspaces |
| `bun test` | Run all tests |

## Stack

AdonisJS v6 · MongoDB ([adonis-odm](https://github.com/DreamsHive/adonis-odm)) · Nuxt 3 + Nuxt UI · better-auth · [open-swagger](https://github.com/DreamsHive/open-swagger) · Docker

## Docs

- [PRD](docs/PRD.md) — product requirements & roadmap

## License

[MIT](LICENSE) © DreamsHive
