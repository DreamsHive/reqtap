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

Developer yang mengintegrasikan webhook (Stripe, GitHub, Shopify, dll.) menghadapi masalah berulang:

1. **Debugging buta** — webhook gagal tanpa terlihat payload/header yang sebenarnya diterima.
2. **Localhost tidak terjangkau** — provider tidak bisa mengirim ke `localhost`; developer terpaksa pakai tunnel pihak ketiga (ngrok/smee) yang terpisah dari tooling inspeksi.
3. **Testing repetitif** — menunggu event asli terjadi ulang hanya untuk men-test satu handler.
4. **Tool yang ada terfragmentasi** — masing-masing hanya menyelesaikan satu masalah:

| Tool | Inspect | Relay ke localhost | Replay | Self-host | Catatan |
|---|---|---|---|---|---|
| webhook.site (OSS) | ✅ | ❌ | ❌ | ⚠️ berat (PHP+Redis) | Fitur penting berbayar |
| webhook-tester (Go) | ✅ | ❌ | ❌ | ✅ | Eksplisit tanpa replay/search |
| smee.io / gosmee | ❌ | ✅ | ❌ | ✅ | Tanpa UI inspeksi |
| Hookdeck / Svix | ✅ | ✅ | ✅ | ❌ | SaaS berbayar, vendor lock-in |

**Gap:** tidak ada satu pun tool self-hostable yang menggabungkan *inspect + relay + replay* dalam satu paket ringan.

## 2. Goals & Non-Goals

### Goals (v1)
- **G1** — Menangkap webhook apa pun via URL unik dan menampilkannya real-time (< 1 detik) di dashboard.
- **G2** — Meneruskan (relay) request live ke localhost developer via satu perintah CLI.
- **G3** — Replay/resend request tersimpan ke target mana pun.
- **G4** — Verifikasi signature otomatis (Stripe & GitHub) dengan indikator jelas.
- **G5** — Self-host dalam satu perintah (`docker compose up -d`).
- **G6** — Time-to-first-value < 2 menit (tanpa signup untuk mencoba via `npx`).

### Non-Goals (v1)
- ❌ Webhook **sending** infrastructure (retry/fan-out ke subscriber — domain Hook0/Svix).
- ❌ Transformasi/routing payload (domain Hookdeck).
- ❌ Billing/paywall — proyek open source penuh.
- ❌ Mobile app native (web responsive cukup).
- ❌ Multi-region / HA clustering.

## 3. Target Users

| Persona | Kebutuhan utama |
|---|---|
| **Backend/fullstack dev** (integrasi payment, git, e-commerce) | Lihat payload asli, forward ke dev server, replay saat debugging |
| **Tim kecil / startup** | Endpoint bersama, self-host demi kontrol data |
| **Dev dengan kebutuhan data sovereignty** | Semua traffic tetap di infrastruktur sendiri |

## 4. User Stories

1. Sebagai developer, saya bisa **membuat endpoint** dan mendapat URL unik dalam < 10 detik.
2. Sebagai developer, saya melihat **request masuk secara real-time** tanpa refresh — method, path, headers, query, body (pretty-printed), IP, ukuran, latency.
3. Sebagai developer, saya menjalankan `npx wh forward <token> --to localhost:3000` dan **request live diteruskan** ke server lokal saya, dengan status response lokal terlihat di terminal.
4. Sebagai developer, saya bisa **replay** request mana pun ke target mana pun, berkali-kali.
5. Sebagai developer, saya melihat **badge verifikasi signature** (valid/invalid) untuk request Stripe/GitHub, beserta peringatan jika gagal.
6. Sebagai developer, saya bisa **search & filter** riwayat request (method, provider, status, isi payload).
7. Sebagai developer, saya bisa **mengatur custom response** (status/body/headers) per endpoint.
8. Sebagai admin, saya bisa **mengundang anggota tim** dan mengelola API keys.
9. Sebagai pengguna self-host, saya menjalankan **satu perintah Docker** dan seluruh stack berjalan.

## 5. Functional Requirements

### 5.1 Ingest
- `ANY /t/:token` menerima semua method HTTP.
- Simpan **raw body** (buffer utuh, tidak dimutasi middleware) — prasyarat verifikasi signature.
- Metadata: method, path, query, headers, IP, content-type, ukuran, timestamp.
- Response configurable per endpoint (default `200 { "received": true }`).
- Batas ukuran body (default 1 MB) + rate limit per endpoint.

### 5.2 Real-time
- Broadcast request baru via WebSocket (channel per token); fallback SSE.
- Dashboard menampilkan request baru < 1 detik tanpa refresh.

### 5.3 Relay CLI (`wh`)
- `wh login` — autentikasi CLI (API key).
- `wh new [--name]` — buat endpoint, tampilkan URL.
- `wh forward <token> --to <url>` — subscribe WS, re-POST setiap request (method/headers/body identik) ke target; tampilkan status + latency; **auto-reconnect**.
- `wh tail <token>` — live view request di terminal.
- `wh replay <requestId> --to <url>` — resend dari CLI.
- Distribusi: `npx @reqtap/cli` (tanpa install).

### 5.4 Replay
- `POST /api/requests/:id/replay` dengan target URL.
- Riwayat replay tersimpan (target, hasil, latency) — halaman Replays.

### 5.5 Signature verification
- Deteksi otomatis via header (`Stripe-Signature`, `X-Hub-Signature-256`).
- Verifikasi terhadap signing secret per endpoint; badge ✅ verified / ❌ invalid + banner peringatan.
- v1: Stripe, GitHub. (v1.1: Shopify, Clerk.)

### 5.6 Manajemen & lainnya
- CRUD endpoint (nama, custom slug, custom response, retention, pause).
- Search & filter request; pagination.
- Auth (email/password + GitHub OAuth via better-auth); API keys (create/revoke, tampil sekali); team invite dengan role (Owner/Admin/Member).
- Analytics overview: total request, success rate, latency, top endpoints, breakdown status code.
- Retention & auto-expiry data (default 30 hari, configurable).
- Notifikasi email: forward gagal, signature gagal, endpoint sepi (opsional per user).

## 6. Technical Architecture

```
Provider ──POST──▶ Ingest (AdonisJS) ──▶ MongoDB (adonis-odm)
                        │
                        ├──▶ WebSocket broadcast ──▶ Dashboard (Nuxt 3)
                        │                        └─▶ CLI (wh forward) ──▶ localhost
                        └──▶ Replay engine
```

| Layer | Teknologi | Alasan |
|---|---|---|
| Server | **AdonisJS v6** + TypeScript | Ekosistem kantor; WS & validator built-in |
| Database | **MongoDB** via **adonis-odm** | Schema-less cocok untuk payload arbitrer; dogfooding |
| Real-time | **@adonisjs/transmit** (SSE/WS) | Channel per token |
| Frontend | **Nuxt 3 + Nuxt UI** + lucide icons | Sesuai design system Figma |
| CLI | **Node + citty + ws** | Ringan, `npx`-able |
| Auth | **better-auth** | Ekosistem kantor |
| API docs | **open-swagger** (Scalar UI) | Dogfooding |
| Deploy | **Docker Compose** (app + mongo) | Self-host 1 perintah |

**Struktur repo:** monorepo pnpm — `apps/server`, `apps/web`, `packages/cli`, `packages/shared`.

### Data model (ringkas)
```
Endpoint { token(unique), name, slug?, responseConfig, provider?, signingSecret?,
           retentionDays, isActive, expiresAt?, teamId, createdAt }
Request  { endpointId(idx), method, path, query, headers, bodyRaw, bodySize,
           contentType, ip, provider?, signatureValid?, createdAt(idx) }
Replay   { requestId, targetUrl, resultStatus, latencyMs, createdAt }
```

## 7. Design

Seluruh UI sudah dirancang di Figma (35 frame, 8 section): landing, dashboard (Overview/Inspector/Endpoints/Replays/Settings/API keys/Team/Notifications), auth lengkap, modals (New endpoint, Connect CLI, ⌘K palette, API key, Invite), states (empty/loading/error/invalid-signature), mobile, dan design system (komponen + Sidebar component + Lucide icons).

**Figma:** `https://www.figma.com/design/nZ2PSI2o1rifcIkFsh6WPa/ShortLink` — page *Design*.

## 8. Success Metrics

| Metric | Target 3 bulan pasca-rilis |
|---|---|
| GitHub stars | 300+ |
| Docker pulls / self-host instance | 500+ |
| `npx` CLI runs | 1.000+ |
| Time-to-first-webhook (median) | < 2 menit |
| Latency ingest→dashboard | < 1 detik (p95) |
| Kontributor eksternal | 3+ |

## 9. Risks & Mitigations

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Raw body termutasi middleware | Signature verify gagal total | Middleware raw-body khusus; **validasi POC minggu 1** |
| WS relay putus → event hilang | Kepercayaan turun | Auto-reconnect + buffer/ack; tampilkan status koneksi |
| Abuse (spam/payload besar) | Storage meledak | Rate limit, body cap, retention, expiry |
| Ruang nama kompetitif (Hook*) | Sulit ditemukan | Nama coined unik (SEO kosong) + positioning "webhook.site + smee in one box" |
| Scope creep 1 bulan | Tidak rilis | Cut-line jelas: G1–G6 wajib; sisanya v1.1 |

## 10. Milestones (4 minggu)

| Minggu | Deliverable |
|---|---|
| **1 — Core** | Monorepo + Docker; model; ingest raw-body (**POC signature**); CRUD API |
| **2 — Real-time** | WS broadcast; dashboard Nuxt (list live + detail + search) |
| **3 — Killer features** | CLI (`new/forward/tail/replay`) + replay engine + UI replay |
| **4 — Launch** | Signature verify; custom response; retention; swagger; README + GIF; demo instance; rilis PH/r/selfhosted/HN |

## 11. Open Questions

1. ~~**Nama final**~~ — ✅ diputuskan: **Reqtap** (`reqtap.dev`). Segera amankan `github.com/reqtap` + npm org `@reqtap`.
2. Demo instance publik: rate-limit anonymous endpoint berapa lama TTL-nya? (usul: 24 jam)
3. Batas tim di self-host: unlimited (karena open source)?
4. Telemetri opt-in (anonymous usage) — pakai `adonis-telemetry` kantor?

---

*Dokumen ini hidup — update seiring keputusan baru.*
