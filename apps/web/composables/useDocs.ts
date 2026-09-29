export type DocsBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lines: string[] }
  | { type: 'callout'; text: string; tone?: 'info' | 'warning' }
  | { type: 'cards'; items: Array<{ icon: string; title: string; body: string; to?: string }> }
  | { type: 'table'; columns: string[]; rows: Array<Record<string, string>>; badgeColumn?: string }
  | { type: 'cta'; label: string; to: string; icon?: string }

export interface DocsPage {
  slug: string
  title: string
  description: string
  eyebrow?: string
  blocks: DocsBlock[]
}

export const docsGroups = [
  {
    section: 'GETTING STARTED',
    items: [
      { label: 'Introduction', slug: 'introduction' },
      { label: 'Quick start', slug: 'quick-start' },
      { label: 'Self-hosting', slug: 'self-hosting' },
      { label: 'Local development', slug: 'local-development' },
    ],
  },
  {
    section: 'FEATURES',
    items: [
      { label: 'Capture requests', slug: 'capture' },
      { label: 'Inspect live traffic', slug: 'inspect' },
      { label: 'Forward to localhost', slug: 'forward' },
      { label: 'Replay requests', slug: 'replay' },
      { label: 'Verify signatures', slug: 'signatures' },
      { label: 'Auth and teams', slug: 'auth-teams' },
      { label: 'Notifications', slug: 'notifications' },
    ],
  },
  {
    section: 'REFERENCE',
    items: [
      { label: 'CLI commands', slug: 'cli' },
      { label: 'REST API', slug: 'api' },
      { label: 'Environment', slug: 'environment' },
      { label: 'Troubleshooting', slug: 'troubleshooting' },
      { label: 'Roadmap', slug: 'roadmap' },
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
  { command: 'npx @reqtap/cli login --apiBase http://localhost:3333', description: 'Save the API base URL locally.' },
  { command: 'npx @reqtap/cli login --apiBase http://localhost:3333 --email you@company.com --password password123', description: 'Login with email/password and store a bearer token.' },
  { command: 'npx @reqtap/cli new --name stripe-dev --slug stripe-dev', description: 'Create a new endpoint and print its capture URL.' },
  { command: 'npx @reqtap/cli tail stripe-dev', description: 'Watch live requests in the terminal.' },
  { command: 'npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks', description: 'Forward live requests to a local handler with reconnect backfill.' },
  { command: 'npx @reqtap/cli replay <request-id> --to localhost:3000/webhooks', description: 'Replay one stored request to a target URL.' },
]

const envVars = [
  { variable: 'APP_URL', example: 'http://localhost:3333', description: 'Public API URL used to build capture URLs.' },
  { variable: 'WEB_URL', example: 'http://localhost:3000', description: 'Public web dashboard URL used in invite and reset emails.' },
  { variable: 'NUXT_PUBLIC_API_BASE', example: 'http://localhost:3333', description: 'API base URL consumed by the web dashboard.' },
  { variable: 'MONGO_URI', example: 'mongodb://mongo:27017/reqtap', description: 'MongoDB connection string.' },
  { variable: 'REQTAP_STORAGE', example: 'mongo | memory', description: 'Storage mode. Memory is useful for local smoke tests.' },
  { variable: 'BODY_LIMIT_BYTES', example: '1048576', description: 'Maximum captured request body size.' },
  { variable: 'RATE_LIMIT_PER_MINUTE', example: '120', description: 'Per-endpoint ingest limit.' },
  { variable: 'AUTH_REQUIRED', example: 'false | true', description: 'Require bearer session/API key for dashboard and management APIs.' },
  { variable: 'SMTP_HOST', example: 'smtp.example.com', description: 'Optional SMTP host for invite, reset, and alert emails.' },
  { variable: 'SMTP_FROM', example: 'Reqtap <alerts@example.com>', description: 'Sender address for notification emails.' },
  { variable: 'APP_KEY', example: 'generate-a-secret', description: 'Adonis application key. Replace before production.' },
]

export const docsPages: DocsPage[] = [
  {
    slug: 'introduction',
    title: 'Webhook inspector, replay tool, and localhost relay in one self-hosted stack.',
    description:
      'Reqtap gives every endpoint a unique capture URL, stores incoming requests with their raw body intact, streams them into the dashboard, forwards live traffic to localhost, and replays saved requests whenever you need to debug an integration.',
    eyebrow: 'Reqtap v0.1',
    blocks: [
      {
        type: 'cards',
        items: [
          { icon: 'i-lucide-inbox', title: 'Capture', body: 'Preserve method, path, headers, query, body, IP, response status, and signature state.' },
          { icon: 'i-lucide-radio', title: 'Stream', body: 'Dashboard and CLI receive new requests through an SSE channel per endpoint token.' },
          { icon: 'i-lucide-repeat', title: 'Replay', body: 'Resend stored requests to localhost, staging, or any HTTP target.' },
        ],
      },
      {
        type: 'paragraph',
        text: 'Use Reqtap when provider webhooks are hard to debug, localhost is unreachable from the provider, or you need to replay the same payload repeatedly while fixing a handler.',
      },
      { type: 'cta', label: 'Start with Quick start', to: '/docs/quick-start', icon: 'i-lucide-arrow-right' },
    ],
  },
  {
    slug: 'quick-start',
    title: 'Quick start',
    description: 'Create an endpoint, send a webhook, inspect it in the dashboard, then forward live traffic to localhost.',
    blocks: [
      { type: 'paragraph', text: 'Use the local API at localhost:3333 and the dashboard at localhost:3000.' },
      {
        type: 'code',
        lines: [
          'npx @reqtap/cli login --apiBase http://localhost:3333',
          'npx @reqtap/cli new --name stripe-dev --slug stripe-dev',
          'curl -X POST http://localhost:3333/t/stripe-dev -H "content-type: application/json" -d \'{"event":"test"}\'',
          'npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks',
        ],
      },
      { type: 'cta', label: 'Open dashboard', to: '/app/inspector', icon: 'i-lucide-layout-dashboard' },
    ],
  },
  {
    slug: 'self-hosting',
    title: 'Self-hosting',
    description: 'Run MongoDB, the API server, and the Nuxt dashboard with Docker Compose.',
    blocks: [
      {
        type: 'code',
        lines: ['cp .env.example .env', 'docker compose up -d', 'open http://localhost:3000'],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'Change APP_KEY before exposing the service publicly. Also set APP_URL, WEB_URL, and NUXT_PUBLIC_API_BASE to the public hostnames used by your deployment.',
      },
      {
        type: 'paragraph',
        text: 'The Compose stack uses MongoDB 7.0 for broad local Docker compatibility and stores application data in the mongo-data volume.',
      },
    ],
  },
  {
    slug: 'local-development',
    title: 'Local development',
    description: 'Run the monorepo locally while keeping MongoDB in Docker.',
    blocks: [
      { type: 'code', lines: ['bun install', 'docker compose up -d mongo', 'bun dev'] },
      {
        type: 'paragraph',
        text: 'The server can also run with REQTAP_STORAGE=memory, which is useful for smoke tests without MongoDB.',
      },
    ],
  },
  {
    slug: 'capture',
    title: 'Capture requests',
    description: 'Send any HTTP method to /t/:token. Nested paths and query strings are preserved for replay and forwarding.',
    blocks: [
      {
        type: 'code',
        lines: [
          'curl -X POST "http://localhost:3333/t/stripe-dev/webhooks/stripe?mode=test" \\',
          '  -H "content-type: application/json" \\',
          '  -d \'{"id":"evt_test","type":"payment_intent.succeeded"}\'',
        ],
      },
      {
        type: 'paragraph',
        text: 'Reqtap stores method, path, query, headers, IP, content type, size, raw body, provider, signature state, and timestamp.',
      },
    ],
  },
  {
    slug: 'inspect',
    title: 'Inspect live traffic',
    description: 'The Inspector page subscribes to /api/events/:token and prepends new requests as they arrive.',
    blocks: [
      {
        type: 'paragraph',
        text: 'You can filter by method, failed status, or search text across path, provider, user agent, and body. The detail panel shows body, headers, query, metadata, and replay controls.',
      },
      { type: 'cta', label: 'Open Inspector', to: '/app/inspector', icon: 'i-lucide-arrow-right' },
    ],
  },
  {
    slug: 'forward',
    title: 'Forward to localhost',
    description: 'Subscribe to a live endpoint stream and send each new request to your local handler.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Forward preserves method, body, most headers, path, and query string. Hop-by-hop headers like host and content-length are regenerated by the HTTP client.',
      },
      {
        type: 'code',
        lines: [
          'npx @reqtap/cli forward stripe-dev --to localhost:3000/webhooks',
          'Listening on http://localhost:3333/t/stripe-dev',
          'POST /webhooks/stripe -> 200 41ms',
        ],
      },
      {
        type: 'paragraph',
        text: 'The CLI stores a local cursor, so reconnects and restarts backfill missed requests from the last acknowledged timestamp.',
      },
    ],
  },
  {
    slug: 'replay',
    title: 'Replay requests',
    description: 'Replay a stored request from the dashboard, the CLI, or the REST API.',
    blocks: [
      {
        type: 'code',
        lines: ['npx @reqtap/cli replay 8ec7... --to localhost:3000/webhooks', 'Replay sent to http://localhost:3000/webhooks -> 204 18ms'],
      },
      {
        type: 'paragraph',
        text: 'Reqtap stores replay target, response status, latency, and any error in the Replays page.',
      },
    ],
  },
  {
    slug: 'signatures',
    title: 'Verify signatures',
    description: 'Reqtap detects Stripe, GitHub, Shopify, and Clerk signatures from request headers.',
    blocks: [
      {
        type: 'table',
        columns: ['value', 'meaning'],
        rows: [
          { value: 'verified', meaning: 'Provider signature is valid for the configured secret.' },
          { value: 'invalid', meaning: 'Provider signature was present but failed verification.' },
          { value: 'missing_secret', meaning: 'Provider was detected but the endpoint has no signing secret.' },
          { value: 'not_detected', meaning: 'No supported signature header was found.' },
        ],
      },
      {
        type: 'paragraph',
        text: 'Set the signing secret on the endpoint settings page. Raw body preservation is required, so Reqtap avoids global JSON body mutation on ingest routes.',
      },
    ],
  },
  {
    slug: 'auth-teams',
    title: 'Auth and teams',
    description: 'Email/password login, password reset, API keys, team invites, and role-gated management APIs are built in.',
    blocks: [
      {
        type: 'code',
        lines: [
          'curl -X POST http://localhost:3333/api/auth/register \\',
          '  -H "content-type: application/json" \\',
          '  -d \'{"name":"Rafli","email":"rafli@example.com","password":"password123"}\'',
        ],
      },
      {
        type: 'paragraph',
        text: 'Self-host installs can stay frictionless with anonymous local usage, or set AUTH_REQUIRED=true to require a bearer session or API key for dashboard and management APIs.',
      },
      {
        type: 'paragraph',
        text: 'Owners and admins can create API keys, invite members, and update roles. Invite links place the new user in the invited team.',
      },
    ],
  },
  {
    slug: 'notifications',
    title: 'Notifications',
    description: 'Reqtap stores notification events for team invites, failed replays/forwards, and invalid signatures.',
    blocks: [
      {
        type: 'paragraph',
        text: 'When SMTP is configured, enabled alert preferences also send email to active team members. Without SMTP, the Notifications page still records the event log.',
      },
      {
        type: 'callout',
        text: 'Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and SMTP_FROM for email delivery.',
      },
    ],
  },
  {
    slug: 'cli',
    title: 'CLI commands',
    description: 'Use the Reqtap CLI for login, endpoint creation, live tailing, forwarding, and replay.',
    blocks: [{ type: 'table', columns: ['command', 'description'], rows: cliCommands }],
  },
  {
    slug: 'api',
    title: 'REST API',
    description: 'Core HTTP routes exposed by the API server. The Scalar reference is also available at /api/docs.',
    blocks: [{ type: 'table', columns: ['method', 'path', 'purpose'], rows: apiRoutes, badgeColumn: 'method' }],
  },
  {
    slug: 'environment',
    title: 'Environment',
    description: 'Production and local settings used by the server, dashboard, and Docker Compose stack.',
    blocks: [{ type: 'table', columns: ['variable', 'example', 'description'], rows: envVars }],
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common local and self-hosting issues.',
    blocks: [
      {
        type: 'cards',
        items: [
          { icon: 'i-lucide-wifi-off', title: 'Dashboard cannot reach the API', body: 'Check NUXT_PUBLIC_API_BASE, CORS, and that GET /health returns status: ok.' },
          { icon: 'i-lucide-badge-alert', title: 'Signature shows invalid', body: 'Confirm the endpoint signing secret, provider header, and that no proxy rewrites the request body.' },
          { icon: 'i-lucide-route', title: 'Forwarding reaches the wrong path', body: 'If the target URL has no path, Reqtap appends the captured request path. Include an explicit path to override it.' },
          { icon: 'i-lucide-box', title: 'Docker build fails locally', body: 'Make sure Docker or OrbStack is running. docker compose config can validate configuration without starting containers.' },
        ],
      },
    ],
  },
  {
    slug: 'roadmap',
    title: 'Roadmap',
    description: 'What is already covered in v0.1 and what is likely next.',
    blocks: [
      {
        type: 'paragraph',
        text: 'The current build covers capture, inspection, replay, localhost forwarding, auth enforcement, API keys, team invites, password reset, email notification events, optional SMTP delivery, provider signature verification, API docs, and persisted CLI relay cursors.',
      },
      {
        type: 'paragraph',
        text: 'Next likely work: GitHub OAuth, npm/domain/demo release operations, and a stronger server-side delivery queue for long offline relay windows.',
      },
    ],
  },
]

export function docsPath(slug: string) {
  return slug === 'introduction' ? '/docs' : `/docs/${slug}`
}

export function findDocsPage(slug?: string) {
  return docsPages.find((page) => page.slug === (slug || 'introduction'))
}

export function docsPager(slug: string) {
  const index = docsPages.findIndex((page) => page.slug === slug)

  return {
    previous: index > 0 ? docsPages[index - 1] : undefined,
    next: index >= 0 && index < docsPages.length - 1 ? docsPages[index + 1] : undefined,
  }
}
