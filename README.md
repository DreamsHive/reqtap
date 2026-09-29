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

# dashboard: http://localhost:3000
# api:       http://localhost:3333

# forward live webhooks to your dev server
npx @reqtap/cli forward <token> --to localhost:3000/webhooks
```

For local development without Docker:

```bash
bun install
docker compose up -d mongo
bun dev
```

## What works in v0.1

- Capture any method at `ANY /t/:token`, preserving raw body bytes.
- Create/list/update/delete endpoints through the API and dashboard.
- Live dashboard updates via SSE (`/api/events/:token`).
- Request inspection with method/path/query/headers/body/IP/size/latency.
- Search and filter request history by method, failure, and text.
- Replay stored requests from the UI/CLI, preserving method/body and replaying path/query.
- CLI commands: `login`, `new`, `tail`, `forward`, `replay`.
- Stripe, GitHub, Shopify, and Clerk signature verification.
- Email/password auth, API keys, team invites, and role-gated management APIs.
- Password reset flow with SMTP email delivery and development fallback links.
- Optional SMTP email notifications for failed replays/forwards, invalid signatures, and invites.
- OpenAPI JSON and Scalar API reference at `/api/openapi.json` and `/api/docs`.
- CLI reconnect backfill with a persisted cursor for `tail` and `forward`.
- MongoDB persistence with TTL retention; memory fallback for local development.
- Docker Compose stack: MongoDB + API server + Nuxt dashboard.

GitHub OAuth and a server-side delivery queue for long offline relay windows are still future work.

## CLI

```bash
npx @reqtap/cli login --apiBase http://localhost:3333
npx @reqtap/cli login --apiBase http://localhost:3333 --email you@company.com --password 'password123'
npx @reqtap/cli new --name stripe-dev --slug stripe-dev --provider stripe --secret whsec_...
npx @reqtap/cli tail stripe-dev
npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks
npx @reqtap/cli replay <request-id> --to localhost:3000/webhooks
```

By default self-host mode allows anonymous local usage. Set `AUTH_REQUIRED=true` to require a session token or API key for dashboard and management APIs.

## Core API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Health, storage mode, subscriber count |
| `POST` | `/api/auth/register` | Create an email/password account |
| `POST` | `/api/auth/login` | Create a session token |
| `POST` | `/api/auth/password/forgot` | Request a password reset |
| `POST` | `/api/auth/password/reset` | Reset password with token |
| `GET` | `/api/auth/me` | Inspect current token |
| `GET` | `/api/openapi.json` | OpenAPI 3.1 document |
| `GET` | `/api/docs` | Scalar API reference |
| `GET` | `/api/api-keys` | List API keys |
| `POST` | `/api/api-keys` | Create API key, secret shown once |
| `DELETE` | `/api/api-keys/:id` | Revoke API key |
| `GET` | `/api/team/members` | List members and pending invites |
| `POST` | `/api/team/invites` | Create team invite |
| `PATCH` | `/api/team/members/:id` | Update member role |
| `GET` | `/api/notifications/preferences` | Load notification preferences |
| `PATCH` | `/api/notifications/preferences` | Update notification preferences |
| `GET` | `/api/notifications/events` | Notification event log |
| `POST` | `/api/endpoints` | Create endpoint |
| `GET` | `/api/endpoints` | List endpoints |
| `PATCH` | `/api/endpoints/:token` | Update endpoint |
| `DELETE` | `/api/endpoints/:token` | Delete endpoint |
| `ANY` | `/t/:token/*?` | Capture webhook |
| `GET` | `/api/requests` | List/search captured requests |
| `GET` | `/api/events/:token` | SSE live stream |
| `POST` | `/api/requests/:id/replay` | Replay a captured request |
| `GET` | `/api/replays` | Replay history |

## Monorepo layout

```
apps/
  server/    # AdonisJS v6 — ingest, REST API, SSE, replay engine
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

AdonisJS v6 · MongoDB Node driver · SSE · Nuxt 3 + Nuxt UI · citty CLI · Docker

## Docs

- [PRD](docs/PRD.md) — product requirements & roadmap

## License

[MIT](LICENSE) © DreamsHive
