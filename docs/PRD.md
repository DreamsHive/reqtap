# PRD — Reqtap

> Self-hostable webhook inspector & relay — capture, inspect, replay, and forward webhooks to localhost.

| | |
|---|---|
| **Status** | Draft v1.0 |
| **Owner** | Muhamad Rafli Al Farizqi |
| **Last updated** | July 2026 |
| **License** | MIT (open source) |
| **Target release** | v0.1.0 — 4 weeks |

---

## 1. Background & Problem

Developers integrating webhooks (Stripe, GitHub, Shopify, etc.) run into the same problems over and over:

1. **Debugging blind** — webhooks fail without any visibility into the actual payload/headers received.
2. **Localhost is unreachable** — providers can't deliver to `localhost`; developers are forced to use third-party tunnels (ngrok/smee) that are disconnected from their inspection tooling.
3. **Repetitive testing** — waiting for a real event to fire again just to test a single handler.
4. **Existing tools are fragmented** — each one only solves a single piece:

| Tool | Inspect | Relay to localhost | Replay | Self-host | Notes |
|---|---|---|---|---|---|
| webhook.site (OSS) | ✅ | ❌ | ❌ | ⚠️ heavy (PHP+Redis) | Key features are paid |
| webhook-tester (Go) | ✅ | ❌ | ❌ | ✅ | Explicitly no replay/search |
| smee.io / gosmee | ❌ | ✅ | ❌ | ✅ | No inspection UI |
| Hookdeck / Svix | ✅ | ✅ | ✅ | ❌ | Paid SaaS, vendor lock-in |

**The gap:** no single self-hostable tool combines *inspect + relay + replay* in one lightweight package.

## 2. Goals & Non-Goals

### Goals (v1)
- **G1** — Capture any webhook via a unique URL and display it in real time (< 1 second) on the dashboard.
- **G2** — Relay live requests to the developer's localhost with a single CLI command.
- **G3** — Replay/resend any stored request to any target.
- **G4** — Automatic signature verification (Stripe & GitHub) with clear indicators.
- **G5** — Self-host with a single command (`docker compose up -d`).
- **G6** — Time-to-first-value < 2 minutes (try it without signup via `npx`).

### Non-Goals (v1)
- ❌ Webhook **sending** infrastructure (retry/fan-out to subscribers — Hook0/Svix territory).
- ❌ Payload transformation/routing (Hookdeck territory).
- ❌ Billing/paywalls — fully open source.
- ❌ Native mobile apps (responsive web is enough).
- ❌ Multi-region / HA clustering.

## 3. Target Users

| Persona | Primary needs |
|---|---|
| **Backend/fullstack dev** (payments, git, e-commerce integrations) | See real payloads, forward to dev server, replay while debugging |
| **Small teams / startups** | Shared endpoints, self-host for data control |
| **Devs with data-sovereignty requirements** | All traffic stays on their own infrastructure |

## 4. User Stories

1. As a developer, I can **create an endpoint** and get a unique URL in < 10 seconds.
2. As a developer, I see **incoming requests in real time** without refreshing — method, path, headers, query, body (pretty-printed), IP, size, latency.
3. As a developer, I run `npx wh forward <token> --to localhost:3000` and **live requests are forwarded** to my local server, with the local response status shown in the terminal.
4. As a developer, I can **replay** any request to any target, as many times as I need.
5. As a developer, I see a **signature verification badge** (valid/invalid) on Stripe/GitHub requests, with a warning when verification fails.
6. As a developer, I can **search & filter** request history (method, provider, status, payload contents).
7. As a developer, I can **configure a custom response** (status/body/headers) per endpoint.
8. As an admin, I can **invite team members** and manage API keys.
9. As a self-hoster, I run **one Docker command** and the whole stack is up.

## 5. Functional Requirements

### 5.1 Ingest
- `ANY /t/:token` accepts every HTTP method.
- Store the **raw body** (untouched buffer, never mutated by middleware) — a prerequisite for signature verification.
- Metadata: method, path, query, headers, IP, content-type, size, timestamp.
- Configurable response per endpoint (default `200 { "received": true }`).
- Body size limit (default 1 MB) + per-endpoint rate limiting.

### 5.2 Real-time
- Broadcast new requests over WebSocket (channel per token); SSE fallback.
- Dashboard shows new requests in < 1 second without refresh.

### 5.3 Relay CLI (`wh`)
- `wh login` — authenticate the CLI (API key).
- `wh new [--name]` — create an endpoint, print its URL.
- `wh forward <token> --to <url>` — subscribe over WS, re-POST every request (identical method/headers/body) to the target; print status + latency; **auto-reconnect**.
- `wh tail <token>` — live request view in the terminal.
- `wh replay <requestId> --to <url>` — resend from the CLI.
- Distribution: `npx @reqtap/cli` (no install required).

### 5.4 Replay
- `POST /api/requests/:id/replay` with a target URL.
- Replay history is stored (target, result, latency) — Replays page.

### 5.5 Signature verification
- Auto-detect via headers (`Stripe-Signature`, `X-Hub-Signature-256`).
- Verify against the endpoint's signing secret; ✅ verified / ❌ invalid badge + warning banner.
- v1: Stripe, GitHub. (v1.1: Shopify, Clerk.)

### 5.6 Management & misc
- Endpoint CRUD (name, custom slug, custom response, retention, pause).
- Request search & filter; pagination.
- Auth (email/password + GitHub OAuth via better-auth); API keys (create/revoke, shown once); team invites with roles (Owner/Admin/Member).
- Analytics overview: total requests, success rate, latency, top endpoints, status-code breakdown.
- Data retention & auto-expiry (default 30 days, configurable).
- Email notifications: failed forwards, failed signatures, quiet endpoints (opt-in per user).

## 6. Technical Architecture

```
Provider ──POST──▶ Ingest (AdonisJS) ──▶ MongoDB (adonis-odm)
                        │
                        ├──▶ WebSocket broadcast ──▶ Dashboard (Nuxt 3)
                        │                        └─▶ CLI (wh forward) ──▶ localhost
                        └──▶ Replay engine
```

| Layer | Technology | Rationale |
|---|---|---|
| Server | **AdonisJS v6** + TypeScript | Company ecosystem; built-in WS & validators |
| Database | **MongoDB** via **adonis-odm** | Schema-less fits arbitrary payloads; dogfooding |
| Real-time | **@adonisjs/transmit** (SSE/WS) | Channel per token |
| Frontend | **Nuxt 3 + Nuxt UI** + Lucide icons | Matches the Figma design system |
| CLI | **Node + citty + ws** | Lightweight, `npx`-able |
| Auth | **better-auth** | Company ecosystem |
| API docs | **open-swagger** (Scalar UI) | Dogfooding |
| Deploy | **Docker Compose** (app + mongo) | One-command self-host |

**Repo structure:** Bun workspaces monorepo — `apps/server`, `apps/web`, `packages/cli`, `packages/shared`.

### Data model (summary)
```
Endpoint { token(unique), name, slug?, responseConfig, provider?, signingSecret?,
           retentionDays, isActive, expiresAt?, teamId, createdAt }
Request  { endpointId(idx), method, path, query, headers, bodyRaw, bodySize,
           contentType, ip, provider?, signatureValid?, createdAt(idx) }
Replay   { requestId, targetUrl, resultStatus, latencyMs, createdAt }
```

## 7. Design

The full UI is designed in Figma (35 frames, 8 sections): landing, dashboard (Overview/Inspector/Endpoints/Replays/Settings/API keys/Team/Notifications), complete auth flow, modals (New endpoint, Connect CLI, ⌘K palette, API key, Invite), states (empty/loading/error/invalid-signature), mobile, and a design system (components + Sidebar component + Lucide icons).

**Figma:** `https://www.figma.com/design/nZ2PSI2o1rifcIkFsh6WPa/ShortLink` — *Design* page.

## 8. Success Metrics

| Metric | Target — 3 months post-launch |
|---|---|
| GitHub stars | 300+ |
| Docker pulls / self-hosted instances | 500+ |
| `npx` CLI runs | 1,000+ |
| Time-to-first-webhook (median) | < 2 minutes |
| Ingest→dashboard latency | < 1 second (p95) |
| External contributors | 3+ |

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Raw body mutated by middleware | Signature verification completely broken | Dedicated raw-body middleware; **POC validation in week 1** |
| WS relay drops → lost events | Loss of trust | Auto-reconnect + buffer/ack; show connection status |
| Abuse (spam/huge payloads) | Storage blow-up | Rate limits, body cap, retention, expiry |
| Crowded "Hook*" namespace | Hard to discover | Unique coined name (clean SEO) + positioning: "webhook.site + smee in one box" |
| One-month scope creep | No release | Clear cut-line: G1–G6 are must-haves; everything else is v1.1 |

## 10. Milestones (4 weeks)

| Week | Deliverable |
|---|---|
| **1 — Core** | Monorepo + Docker; models; raw-body ingest (**signature POC**); CRUD API |
| **2 — Real-time** | WS broadcast; Nuxt dashboard (live list + detail + search) |
| **3 — Killer features** | CLI (`new/forward/tail/replay`) + replay engine + replay UI |
| **4 — Launch** | Signature verification; custom responses; retention; swagger; README + GIF; demo instance; launch on PH/r/selfhosted/HN |

## 11. Open Questions

1. ~~**Final name**~~ — ✅ decided: **Reqtap** (`reqtap.dev`). Secure `github.com/reqtap` + the `@reqtap` npm org soon.
2. Public demo instance: what TTL for anonymous endpoints? (proposal: 24 hours)
3. Team limits on self-host: unlimited (since it's open source)?
4. Opt-in telemetry (anonymous usage) — use the company's `adonis-telemetry`?

---

*This is a living document — update it as decisions land.*
