<script setup lang="ts">
useHead({ title: 'Docs · Reqtap' })

const nav = [
  {
    section: 'GETTING STARTED',
    items: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Quick start', href: '#quick-start' },
      { label: 'Self-hosting', href: '#self-hosting' },
      { label: 'Local development', href: '#local-development' },
    ],
  },
  {
    section: 'FEATURES',
    items: [
      { label: 'Capture requests', href: '#capture' },
      { label: 'Inspect live traffic', href: '#inspect' },
      { label: 'Forward to localhost', href: '#forward' },
      { label: 'Replay requests', href: '#replay' },
      { label: 'Verify signatures', href: '#signatures' },
      { label: 'Auth and teams', href: '#auth-teams' },
      { label: 'Notifications', href: '#notifications' },
    ],
  },
  {
    section: 'REFERENCE',
    items: [
      { label: 'CLI commands', href: '#cli' },
      { label: 'REST API', href: '#api' },
      { label: 'Environment', href: '#environment' },
      { label: 'Troubleshooting', href: '#troubleshooting' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
  },
]

const apiRoutes = [
  { method: 'GET', path: '/health', purpose: 'Health, storage mode, subscriber count' },
  { method: 'POST', path: '/api/auth/register', purpose: 'Create an email/password account, optionally from an invite' },
  { method: 'POST', path: '/api/auth/login', purpose: 'Create a session token' },
  { method: 'POST', path: '/api/auth/password/forgot', purpose: 'Request a password reset email' },
  { method: 'POST', path: '/api/auth/password/reset', purpose: 'Reset password with token' },
  { method: 'GET', path: '/api/auth/me', purpose: 'Inspect current bearer token' },
  { method: 'GET', path: '/api/openapi.json', purpose: 'OpenAPI 3.1 document' },
  { method: 'GET', path: '/api/docs', purpose: 'Scalar API reference' },
  { method: 'GET', path: '/api/api-keys', purpose: 'List API keys for the current team' },
  { method: 'POST', path: '/api/api-keys', purpose: 'Create an API key; secret is returned once' },
  { method: 'DELETE', path: '/api/api-keys/:id', purpose: 'Revoke an API key' },
  { method: 'GET', path: '/api/team/members', purpose: 'List team members and pending invites' },
  { method: 'POST', path: '/api/team/invites', purpose: 'Invite a team member' },
  { method: 'PATCH', path: '/api/team/members/:id', purpose: 'Update a member role' },
  { method: 'GET', path: '/api/notifications/preferences', purpose: 'Load email notification preferences' },
  { method: 'PATCH', path: '/api/notifications/preferences', purpose: 'Update email notification preferences' },
  { method: 'GET', path: '/api/notifications/events', purpose: 'List notification events' },
  { method: 'GET', path: '/api/stats', purpose: 'Overview metrics for the dashboard' },
  { method: 'POST', path: '/api/endpoints', purpose: 'Create a capture endpoint' },
  { method: 'GET', path: '/api/endpoints', purpose: 'List endpoints' },
  { method: 'PATCH', path: '/api/endpoints/:token', purpose: 'Update endpoint config' },
  { method: 'DELETE', path: '/api/endpoints/:token', purpose: 'Delete endpoint and captured traffic' },
  { method: 'ANY', path: '/t/:token/*', purpose: 'Capture webhook requests' },
  { method: 'GET', path: '/api/requests', purpose: 'Search and filter captured requests' },
  { method: 'GET', path: '/api/requests/:id', purpose: 'Fetch a single captured request' },
  { method: 'GET', path: '/api/events/:token', purpose: 'SSE live stream for an endpoint' },
  { method: 'POST', path: '/api/requests/:id/replay', purpose: 'Replay a captured request' },
  { method: 'GET', path: '/api/replays', purpose: 'Replay history' },
]

const cliCommands = [
  { cmd: 'npx @reqtap/cli login --apiBase http://localhost:3333', desc: 'Save the API base URL locally.' },
  { cmd: 'npx @reqtap/cli login --apiBase http://localhost:3333 --email you@company.com --password password123', desc: 'Login with email/password and store a bearer token.' },
  { cmd: 'npx @reqtap/cli new --name stripe-dev --slug stripe-dev', desc: 'Create a new endpoint and print its capture URL.' },
  { cmd: 'npx @reqtap/cli tail stripe-dev', desc: 'Watch live requests in the terminal.' },
  { cmd: 'npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks', desc: 'Forward live requests to a local handler with reconnect backfill.' },
  { cmd: 'npx @reqtap/cli replay <request-id> --to localhost:3000/webhooks', desc: 'Replay one stored request to a target URL.' },
]

const envVars = [
  { key: 'APP_URL', value: 'http://localhost:3333', desc: 'Public API URL used to build capture URLs.' },
  { key: 'WEB_URL', value: 'http://localhost:3000', desc: 'Public web dashboard URL used in invite emails.' },
  { key: 'NUXT_PUBLIC_API_BASE', value: 'http://localhost:3333', desc: 'API base URL consumed by the web dashboard.' },
  { key: 'MONGO_URI', value: 'mongodb://mongo:27017/reqtap', desc: 'MongoDB connection string.' },
  { key: 'REQTAP_STORAGE', value: 'mongo | memory', desc: 'Storage mode. Memory is useful for local smoke tests.' },
  { key: 'BODY_LIMIT_BYTES', value: '1048576', desc: 'Maximum captured request body size.' },
  { key: 'RATE_LIMIT_PER_MINUTE', value: '120', desc: 'Per-endpoint ingest limit.' },
  { key: 'AUTH_REQUIRED', value: 'false | true', desc: 'Require bearer session/API key for dashboard and management APIs.' },
  { key: 'SMTP_HOST', value: 'smtp.example.com', desc: 'Optional SMTP host for invite and alert emails.' },
  { key: 'SMTP_FROM', value: 'Reqtap <alerts@example.com>', desc: 'Sender address for notification emails.' },
  { key: 'APP_KEY', value: 'generate-a-secret', desc: 'Adonis application key.' },
]

const statuses = [
  { value: 'verified', meaning: 'Provider signature is valid for the configured secret.' },
  { value: 'invalid', meaning: 'Provider signature was present but failed verification.' },
  { value: 'missing_secret', meaning: 'Provider was detected but the endpoint has no signing secret.' },
  { value: 'not_detected', meaning: 'No supported signature header was found.' },
]
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <header class="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-line)] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
      <div class="flex items-center gap-2">
        <AppLogo />
        <span class="rounded-md bg-brand-500/10 px-2 py-[3px] text-[12px] font-semibold text-brand-500">Docs</span>
      </div>
      <nav class="hidden items-center gap-6 text-sm font-medium text-gray-500 md:flex">
        <a href="#quick-start" class="hover:text-ink">Quick start</a>
        <a href="#api" class="hover:text-ink">API</a>
        <a href="#cli" class="hover:text-ink">CLI</a>
        <NuxtLink to="/app/inspector" class="hover:text-ink">Dashboard</NuxtLink>
        <a href="https://github.com/DreamsHive/reqtap" target="_blank" rel="noopener noreferrer" class="hover:text-ink">GitHub</a>
      </nav>
    </header>

    <div class="mx-auto flex w-full max-w-[1240px] items-start">
      <aside class="sticky top-[65px] hidden h-[calc(100vh-65px)] w-[270px] shrink-0 overflow-y-auto border-r border-[var(--color-line)] px-5 py-7 lg:flex lg:flex-col lg:gap-1.5">
        <template v-for="group in nav" :key="group.section">
          <p class="px-2.5 pb-1 pt-3 text-[11px] font-semibold tracking-[1px] text-gray-400">{{ group.section }}</p>
          <a
            v-for="item in group.items"
            :key="item.href"
            :href="item.href"
            class="rounded-[7px] px-2.5 py-[7px] text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
          >{{ item.label }}</a>
        </template>
      </aside>

      <main class="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
        <article class="mx-auto flex max-w-[820px] flex-col gap-10">
          <section id="introduction" class="scroll-mt-24">
            <p class="text-sm font-semibold uppercase tracking-[1.5px] text-brand-500">Reqtap v0.1</p>
            <h1 class="mt-3 text-[36px] font-extrabold leading-tight text-ink sm:text-[44px]">Webhook inspector, replay tool, and localhost relay in one self-hosted stack.</h1>
            <p class="mt-4 text-[17px] leading-[1.65] text-gray-500">
              Reqtap gives every endpoint a unique capture URL, stores incoming requests with their raw body intact,
              streams them into the dashboard, forwards live traffic to your local handler, and replays saved requests
              whenever you need to debug a webhook integration.
            </p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <UIcon name="i-lucide-inbox" class="size-5 text-brand-500" />
                <p class="mt-3 text-sm font-semibold">Capture</p>
                <p class="mt-1 text-[13px] leading-[1.5] text-gray-500">Preserve method, path, headers, query, body, IP, and response status.</p>
              </div>
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <UIcon name="i-lucide-radio" class="size-5 text-brand-500" />
                <p class="mt-3 text-sm font-semibold">Stream</p>
                <p class="mt-1 text-[13px] leading-[1.5] text-gray-500">Dashboard and CLI receive new requests through an SSE channel.</p>
              </div>
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <UIcon name="i-lucide-repeat" class="size-5 text-brand-500" />
                <p class="mt-3 text-sm font-semibold">Replay</p>
                <p class="mt-1 text-[13px] leading-[1.5] text-gray-500">Resend stored requests to localhost, staging, or any HTTP target.</p>
              </div>
            </div>
          </section>

          <section id="quick-start" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Quick start</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Use the local API at `localhost:3333` and the dashboard at `localhost:3000` or the next available Nuxt port.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli login --apiBase http://localhost:3333</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli new --name stripe-dev --slug stripe-dev</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">curl -X POST http://localhost:3333/t/stripe-dev -H 'content-type: application/json' -d '{"event":"test"}'</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks</span></p>
            </div>
          </section>

          <section id="self-hosting" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Self-hosting</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Docker Compose starts MongoDB, the Adonis API server, and the Nuxt dashboard.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">cp .env.example .env</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">docker compose up -d</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">open http://localhost:3000</span></p>
            </div>
            <div class="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-[1.6] text-amber-800">
              Change `APP_KEY` before exposing the service publicly. Also set `APP_URL` and `NUXT_PUBLIC_API_BASE` to the public hostnames used by your deployment.
            </div>
          </section>

          <section id="local-development" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Local development</h2>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">bun install</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">docker compose up -d mongo</span></p>
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">bun dev</span></p>
            </div>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              The server falls back to memory storage when `REQTAP_STORAGE=memory`, which is useful for smoke tests without MongoDB.
            </p>
          </section>

          <section id="capture" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Capture requests</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Send any HTTP method to `/t/:token`. Nested paths and query strings are preserved, so replay and forwarding can target the same handler path.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">curl -X POST 'http://localhost:3333/t/stripe-dev/webhooks/stripe?mode=test' \</span></p>
              <p><span class="pl-4 text-[#e7e7ec]">-H 'content-type: application/json' \</span></p>
              <p><span class="pl-4 text-[#e7e7ec]">-d '{"id":"evt_test","type":"payment_intent.succeeded"}'</span></p>
            </div>
          </section>

          <section id="inspect" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Inspect live traffic</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              The Inspector page subscribes to `/api/events/:token` and prepends new requests as they arrive. You can filter by method, failed status, or search text across path, provider, user agent, and body.
            </p>
            <NuxtLink
              to="/app/inspector"
              class="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Open Inspector
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </section>

          <section id="forward" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Forward to localhost</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              `forward` subscribes to the live endpoint stream and sends each new request to your target. It preserves method, body, most headers, path, and query string. Hop-by-hop headers like `host` and `content-length` are regenerated by the HTTP client. The CLI stores a local cursor, so reconnects and restarts backfill missed requests from the last acknowledged timestamp.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks</span></p>
              <p><span class="font-semibold text-brand-400">i </span><span class="text-[#a78bfa]">Listening on http://localhost:3333/t/stripe-dev</span></p>
              <p><span class="font-semibold text-green-400">ok </span><span class="text-[#e7e7ec]">POST /webhooks/stripe -> 200 41ms</span></p>
            </div>
          </section>

          <section id="replay" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Replay requests</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Replay a request from the dashboard or CLI. Reqtap stores replay target, response status, latency, and any error in the Replays page.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli replay 8ec7... --to localhost:3000/webhooks</span></p>
              <p><span class="font-semibold text-green-400">ok </span><span class="text-[#e7e7ec]">Replay sent to http://localhost:3000/webhooks -> 204 18ms</span></p>
            </div>
          </section>

          <section id="signatures" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Verify signatures</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Reqtap detects Stripe, GitHub, Shopify, and Clerk signatures from request headers and verifies them against the endpoint signing secret.
            </p>
            <div class="mt-4 overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-white">
              <div class="grid grid-cols-[180px_1fr] border-b border-[var(--color-line)] bg-subtle px-4 py-3 text-[12px] font-semibold text-gray-500">
                <span>Status</span>
                <span>Meaning</span>
              </div>
              <div
                v-for="status in statuses"
                :key="status.value"
                class="grid grid-cols-[180px_1fr] border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
              >
                <span class="rt-mono font-semibold text-ink">{{ status.value }}</span>
                <span class="text-gray-600">{{ status.meaning }}</span>
              </div>
            </div>
          </section>

          <section id="auth-teams" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Auth and teams</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Email/password login and password reset are built in. Self-host installs can stay frictionless with anonymous local usage, or set `AUTH_REQUIRED=true` to require a bearer session or API key for dashboard and management APIs.
            </p>
            <div class="rt-mono mt-4 overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p><span class="font-semibold text-brand-400">$ </span><span class="text-[#e7e7ec]">curl -X POST http://localhost:3333/api/auth/register \</span></p>
              <p><span class="pl-4 text-[#e7e7ec]">-H 'content-type: application/json' \</span></p>
              <p><span class="pl-4 text-[#e7e7ec]">-d '{"name":"Rafli","email":"rafli@example.com","password":"password123"}'</span></p>
            </div>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Owners and admins can create API keys, invite members, and update roles. Invite links point to `/auth/register?invite=...` and place the new user in the invited team. Password reset links are sent through SMTP; in development without SMTP, the API returns a reset link token for local testing.
            </p>
          </section>

          <section id="notifications" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Notifications</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              Reqtap stores notification events for team invites, failed replays/forwards, and invalid signatures. When SMTP is configured, enabled alert preferences also send email to active team members.
            </p>
            <div class="mt-4 rounded-[10px] border border-[var(--color-line)] bg-white p-4 text-[13px] leading-[1.65] text-gray-600">
              Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` for email delivery. Without SMTP, the Notifications page still records the event log.
            </div>
          </section>

          <section id="cli" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">CLI commands</h2>
            <div class="mt-4 flex flex-col gap-3">
              <div v-for="item in cliCommands" :key="item.cmd" class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <p class="rt-mono break-all text-[13px] font-semibold text-brand-600">{{ item.cmd }}</p>
                <p class="mt-2 text-[13px] leading-[1.55] text-gray-500">{{ item.desc }}</p>
              </div>
            </div>
          </section>

          <section id="api" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">REST API</h2>
            <div class="mt-4 overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-white">
              <div class="grid grid-cols-[90px_minmax(220px,1fr)_1.2fr] border-b border-[var(--color-line)] bg-subtle px-4 py-3 text-[12px] font-semibold text-gray-500">
                <span>Method</span>
                <span>Path</span>
                <span>Purpose</span>
              </div>
              <div
                v-for="route in apiRoutes"
                :key="`${route.method}-${route.path}`"
                class="grid grid-cols-[90px_minmax(220px,1fr)_1.2fr] gap-3 border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
              >
                <MethodBadge :method="route.method" class="w-fit" />
                <span class="rt-mono break-all font-medium text-ink">{{ route.path }}</span>
                <span class="text-gray-600">{{ route.purpose }}</span>
              </div>
            </div>
          </section>

          <section id="environment" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Environment</h2>
            <div class="mt-4 overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-white">
              <div class="grid grid-cols-[190px_190px_1fr] border-b border-[var(--color-line)] bg-subtle px-4 py-3 text-[12px] font-semibold text-gray-500">
                <span>Variable</span>
                <span>Example</span>
                <span>Description</span>
              </div>
              <div
                v-for="item in envVars"
                :key="item.key"
                class="grid grid-cols-[190px_190px_1fr] gap-3 border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
              >
                <span class="rt-mono font-semibold text-ink">{{ item.key }}</span>
                <span class="rt-mono break-all text-brand-600">{{ item.value }}</span>
                <span class="text-gray-600">{{ item.desc }}</span>
              </div>
            </div>
          </section>

          <section id="troubleshooting" class="scroll-mt-24">
            <h2 class="text-[26px] font-bold text-ink">Troubleshooting</h2>
            <div class="mt-4 flex flex-col gap-3">
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <p class="font-semibold">Dashboard cannot reach the API</p>
                <p class="mt-1 text-[13px] leading-[1.6] text-gray-500">Check `NUXT_PUBLIC_API_BASE`, CORS, and that `GET /health` returns `status: ok`.</p>
              </div>
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <p class="font-semibold">Signature shows invalid</p>
                <p class="mt-1 text-[13px] leading-[1.6] text-gray-500">Confirm the endpoint signing secret, provider header, and that no proxy rewrites the request body.</p>
              </div>
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <p class="font-semibold">Forwarding reaches the wrong path</p>
                <p class="mt-1 text-[13px] leading-[1.6] text-gray-500">If the target URL has no path, Reqtap appends the captured request path. Include an explicit path to override it.</p>
              </div>
              <div class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                <p class="font-semibold">Docker build fails locally</p>
                <p class="mt-1 text-[13px] leading-[1.6] text-gray-500">Make sure Docker or OrbStack is running. `docker compose config` can validate configuration without starting containers.</p>
              </div>
            </div>
          </section>

          <section id="roadmap" class="scroll-mt-24 pb-12">
            <h2 class="text-[26px] font-bold text-ink">Roadmap</h2>
            <p class="mt-3 text-[15px] leading-[1.7] text-gray-600">
              The current build covers capture, inspection, replay, localhost forwarding, auth enforcement, API keys, team invites, password reset, email notification events, optional SMTP delivery, provider signature verification, API docs, and persisted CLI relay cursors. Next likely work: GitHub OAuth, npm/domain/demo release operations, and a stronger server-side delivery queue for long offline relay windows.
            </p>
          </section>
        </article>
      </main>
    </div>
  </div>
</template>
