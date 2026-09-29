import env from '#start/env'
import router from '@adonisjs/core/services/router'
import type { HttpContext } from '@adonisjs/core/http'
import type { NotificationEvent } from '@reqtap/shared'
import { notificationMailer } from '#services/notification_mailer'
import { realtime } from '#services/realtime'
import { sendReplay } from '#services/replay_sender'
import {
  DEFAULT_TEAM_ID,
  store,
  type AuthPrincipal,
  type EndpointInput,
  type NotificationPreferenceKey,
} from '#services/store'
import { verifySignature } from '#services/signature_verifier'
import {
  normalizeHeaders,
  normalizeQuery,
  PayloadTooLargeError,
  readJsonBody,
  readRawBody,
} from '#services/http_payload'

const BODY_LIMIT_BYTES = env.get('BODY_LIMIT_BYTES') ?? 1_048_576
const RATE_LIMIT_PER_MINUTE = env.get('RATE_LIMIT_PER_MINUTE') ?? 120
const rateLimitBuckets = new Map<string, { windowStartedAt: number; count: number }>()

router.get('/', async () => {
  const health = await store.health()

  return {
    name: 'Reqtap',
    status: 'ok',
    storage: health.storage,
    endpoints: {
      create: '/api/endpoints',
      ingest: '/t/:token',
      stream: '/api/events/:token',
    },
  }
})

router.get('/health', health)
router.get('/api/health', health)

router.post('/api/auth/register', async (ctx) => {
  try {
    const body = await readJsonBody<{ name: string; email: string; password: string; inviteId?: string }>(
      ctx.request.request
    )
    const result = await store.registerUser(body)
    return ctx.response.created({ data: result.user, token: result.token })
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.post('/api/auth/login', async (ctx) => {
  try {
    const body = await readJsonBody<{ email: string; password: string }>(ctx.request.request)
    const result = await store.loginUser(body)
    return { data: result.user, token: result.token }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.post('/api/auth/password/forgot', async (ctx) => {
  try {
    const body = await readJsonBody<{ email: string }>(ctx.request.request)
    const reset = await store.createPasswordReset(body.email)

    if (reset) {
      await notificationMailer.sendPasswordReset({
        email: reset.email,
        token: reset.token,
        name: reset.user.name,
      })
    }

    return {
      ok: true,
      devResetToken: reset && !notificationMailer.enabled && env.get('NODE_ENV') !== 'production' ? reset.token : undefined,
    }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.post('/api/auth/password/reset', async (ctx) => {
  try {
    const body = await readJsonBody<{ token: string; password: string }>(ctx.request.request)

    if (!body.token) {
      return ctx.response.badRequest({ error: 'token is required' })
    }

    await store.resetPassword(body.token, body.password)
    return { ok: true }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.get('/api/auth/me', async (ctx) => {
  const principal = await principalFor(ctx)
  if (principal.kind === 'anonymous') {
    return ctx.response.unauthorized({ error: 'Not authenticated' })
  }

  return { data: principal.user ?? principal.apiKey, kind: principal.kind }
})

router.get('/api/openapi.json', async () => openApiSpec())

router.get('/api/docs', async (ctx) => {
  ctx.response.header('content-type', 'text/html; charset=utf-8')
  return ctx.response.send(`<!doctype html>
<html>
  <head>
    <title>Reqtap API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/api/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`)
})

router.get('/api/api-keys', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.listApiKeys(principal.teamId) }
})

router.post('/api/api-keys', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  try {
    const body = await readJsonBody<{ name?: string }>(ctx.request.request)
    const result = await store.createApiKey({ teamId: principal.teamId, name: body.name })
    return ctx.response.created({ data: result.data, key: result.key })
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.delete('/api/api-keys/:id', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  const deleted = await store.revokeApiKey(principal.teamId, ctx.params.id)
  if (!deleted) {
    return ctx.response.notFound({ error: 'API key not found' })
  }

  return ctx.response.noContent()
})

router.get('/api/team/members', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.listTeamMembers(principal.teamId) }
})

router.post('/api/team/invites', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  try {
    const body = await readJsonBody<{ email: string; role?: string; message?: string }>(ctx.request.request)
    const invite = await store.createTeamInvite({
      teamId: principal.teamId,
      email: body.email,
      role: body.role as any,
      message: body.message,
    })
    await notificationMailer.sendInvite(invite)
    return ctx.response.created({ data: invite })
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.patch('/api/team/members/:id', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  try {
    const body = await readJsonBody<{ role?: string }>(ctx.request.request)
    const updated = await store.updateTeamMemberRole(principal.teamId, ctx.params.id, body.role as any)
    if (!updated) {
      return ctx.response.notFound({ error: 'Team member not found' })
    }
    return { ok: true }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.get('/api/notifications/preferences', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.getNotificationPreferences(principal.teamId) }
})

router.patch('/api/notifications/preferences', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  try {
    const body = await readJsonBody<Record<string, boolean>>(ctx.request.request)
    return { data: await store.updateNotificationPreferences(principal.teamId, body) }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.get('/api/notifications/events', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.listNotificationEvents(principal.teamId, numberParam(ctx.request.qs().limit) ?? 50) }
})

router.get('/api/stats', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return store.overviewStats(principal.teamId)
})

router.get('/api/endpoints', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.listEndpoints(principal.teamId) }
})

router.post('/api/endpoints', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  try {
    const body = await readJsonBody<EndpointInput>(ctx.request.request)
    const endpoint = await store.createEndpoint({ ...body, teamId: body.teamId ?? principal.teamId })

    return ctx.response.created({
      data: endpoint,
      url: endpointUrl(endpoint.token),
    })
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.get('/api/endpoints/:token', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  const endpoint = await store.findEndpointByToken(ctx.params.token, principal.teamId)

  if (!endpoint) {
    return ctx.response.notFound({ error: 'Endpoint not found' })
  }

  return { data: endpoint }
})

router.patch('/api/endpoints/:token', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  try {
    const body = await readJsonBody<EndpointInput>(ctx.request.request)
    const endpoint = await store.updateEndpoint(ctx.params.token, body, principal.teamId)

    if (!endpoint) {
      return ctx.response.notFound({ error: 'Endpoint not found' })
    }

    return { data: endpoint }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.delete('/api/endpoints/:token', async (ctx) => {
  const principal = await requirePrincipal(ctx, ['Owner', 'Admin'])
  if (!principal) return

  const deleted = await store.deleteEndpoint(ctx.params.token, principal.teamId)

  if (!deleted) {
    return ctx.response.notFound({ error: 'Endpoint not found' })
  }

  return ctx.response.noContent()
})

router.get('/api/requests', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  return {
    data: await store.listRequests({
      teamId: principal.teamId,
      token: stringParam(ctx.request.qs().token),
      method: stringParam(ctx.request.qs().method),
      status: stringParam(ctx.request.qs().status),
      q: stringParam(ctx.request.qs().q),
      since: stringParam(ctx.request.qs().since),
      limit: numberParam(ctx.request.qs().limit),
    }),
  }
})

router.get('/api/requests/:id', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  const webhookRequest = await store.findRequestById(ctx.params.id, principal.teamId)

  if (!webhookRequest) {
    return ctx.response.notFound({ error: 'Request not found' })
  }

  return { data: webhookRequest }
})

router.post('/api/requests/:id/replay', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  try {
    const body = await readJsonBody<{ targetUrl?: string; target?: string }>(ctx.request.request)
    const targetUrl = body.targetUrl ?? body.target

    if (!targetUrl) {
      return ctx.response.badRequest({ error: 'targetUrl is required' })
    }

    const webhookRequest = await store.findRequestById(ctx.params.id, principal.teamId)

    if (!webhookRequest) {
      return ctx.response.notFound({ error: 'Request not found' })
    }

    const result = await sendReplay(webhookRequest, targetUrl)
    const replay = await store.saveReplay({
      requestId: webhookRequest.id,
      teamId: principal.teamId,
      targetUrl: result.targetUrl,
      resultStatus: result.resultStatus,
      latencyMs: result.latencyMs,
      error: result.error,
    })

    if (result.error) {
      await notifyTeam(
        principal.teamId,
        {
          type: 'forward_failed',
          title: 'Replay failed',
          body: `${webhookRequest.method} ${webhookRequest.path} failed to replay to ${result.targetUrl}: ${result.error}`,
        },
        'failedWebhookAlerts'
      )
    }

    realtime.publish(webhookRequest.token, { type: 'replay.result', data: replay })

    return {
      data: replay,
    }
  } catch (error) {
    return handleRouteError(ctx, error)
  }
})

router.get('/api/replays', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return
  return { data: await store.listReplays(numberParam(ctx.request.qs().limit) ?? 50, principal.teamId) }
})

router.get('/api/events/:token', async (ctx) => {
  const principal = await requirePrincipal(ctx)
  if (!principal) return

  const endpoint = await store.findEndpointByToken(ctx.params.token, principal.teamId)

  if (!endpoint) {
    return ctx.response.notFound({ error: 'Endpoint not found' })
  }

  const corsHeaders = eventStreamCorsHeaders(ctx)

  return new Promise<void>((resolve) => {
    realtime.subscribe(ctx.params.token, ctx.response.response, resolve, corsHeaders)
    ctx.request.request.on('close', resolve)
  })
})

async function ingest(ctx: HttpContext) {
  const started = performance.now()
  const token = ctx.params.token
  const endpoint = await store.findEndpointByToken(token)

  if (!endpoint || !endpoint.isActive) {
    return ctx.response.notFound({ error: 'Endpoint not found' })
  }

  if (isRateLimited(token)) {
    return ctx.response.tooManyRequests({ error: 'Rate limit exceeded' })
  }

  try {
    const rawBody = await readRawBody(ctx.request.request, BODY_LIMIT_BYTES)
    const headers = normalizeHeaders(ctx.request.headers())
    const signature = verifySignature(headers, rawBody, endpoint.provider, endpoint.signingSecret)
    const responseStatus = endpoint.responseConfig.status
    const webhookRequest = await store.saveRequest(endpoint, {
      token,
      method: ctx.request.method(),
      path: capturedPath(ctx.request.url(false), token),
      query: normalizeQuery(ctx.request.qs()),
      headers,
      bodyRaw: rawBody.toString('utf8'),
      bodyBase64: rawBody.toString('base64'),
      bodySize: rawBody.byteLength,
      contentType: ctx.request.header('content-type'),
      ip: ctx.request.ip(),
      provider: signature.provider,
      signatureStatus: signature.status,
      signatureValid: signature.valid,
      responseStatus,
      latencyMs: Math.round(performance.now() - started),
      createdAt: new Date().toISOString(),
    })

    if (webhookRequest.signatureStatus === 'invalid') {
      await notifyTeam(
        endpoint.teamId ?? DEFAULT_TEAM_ID,
        {
          type: 'signature_failed',
          title: 'Signature verification failed',
          body: `${webhookRequest.method} ${webhookRequest.path} failed ${
            webhookRequest.provider ?? 'provider'
          } signature verification.`,
        },
        'signatureFailures'
      )
    }

    realtime.publish(token, { type: 'request.new', data: webhookRequest })

    for (const [key, value] of Object.entries(endpoint.responseConfig.headers ?? {})) {
      ctx.response.header(key, value)
    }

    return ctx.response.status(responseStatus).send(endpoint.responseConfig.body ?? '')
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return ctx.response.requestEntityTooLarge({ error: error.message })
    }

    return handleRouteError(ctx, error)
  }
}

router.any('/t/:token', ingest)
router.any('/t/:token/*', ingest)

async function notifyTeam(
  teamId: string,
  input: Pick<NotificationEvent, 'type' | 'title' | 'body'>,
  preferenceKey: NotificationPreferenceKey
) {
  const event = await store.createNotificationEvent(teamId, input)
  const preferences = await store.getNotificationPreferences(teamId)

  if (!preferences[preferenceKey]) {
    return event
  }

  await notificationMailer.sendEvent(event, await store.listTeamMembers(teamId))
  return event
}

async function health() {
  const storage = await store.health()

  return {
    status: 'ok',
    storage,
    subscribers: realtime.subscriberCount(),
  }
}

function openApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Reqtap API',
      version: '0.1.0',
      description: 'Self-hostable webhook inspector, replay tool, and localhost relay API.',
    },
    servers: [{ url: env.get('APP_URL') ?? `http://${env.get('HOST')}:${env.get('PORT')}` }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      schemas: {
        EndpointInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            slug: { type: 'string' },
            provider: { type: 'string', enum: ['stripe', 'github', 'shopify', 'clerk'] },
            signingSecret: { type: 'string' },
            retentionDays: { type: 'integer', minimum: 1, maximum: 365 },
            isActive: { type: 'boolean' },
            responseConfig: {
              type: 'object',
              properties: {
                status: { type: 'integer', minimum: 100, maximum: 599 },
                body: { type: 'string' },
                headers: { type: 'object', additionalProperties: { type: 'string' } },
              },
            },
          },
        },
        ReplayInput: {
          type: 'object',
          required: ['targetUrl'],
          properties: {
            targetUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          security: [],
          summary: 'Health check',
          responses: { '200': { description: 'Server status' } },
        },
      },
      '/api/auth/register': {
        post: {
          security: [],
          summary: 'Register user',
          responses: { '201': { description: 'Created user and session token' } },
        },
      },
      '/api/auth/login': {
        post: {
          security: [],
          summary: 'Login user',
          responses: { '200': { description: 'Session token' } },
        },
      },
      '/api/auth/password/forgot': {
        post: {
          security: [],
          summary: 'Request password reset',
          responses: { '200': { description: 'Reset accepted' } },
        },
      },
      '/api/auth/password/reset': {
        post: {
          security: [],
          summary: 'Reset password',
          responses: { '200': { description: 'Password updated' } },
        },
      },
      '/api/stats': { get: { summary: 'Dashboard overview', responses: { '200': { description: 'Stats' } } } },
      '/api/endpoints': {
        get: { summary: 'List endpoints', responses: { '200': { description: 'Endpoint list' } } },
        post: {
          summary: 'Create endpoint',
          requestBody: jsonBodyRef('EndpointInput'),
          responses: { '201': { description: 'Created endpoint' } },
        },
      },
      '/api/endpoints/{token}': {
        get: { summary: 'Get endpoint', parameters: [pathParam('token')], responses: { '200': { description: 'Endpoint' } } },
        patch: {
          summary: 'Update endpoint',
          parameters: [pathParam('token')],
          requestBody: jsonBodyRef('EndpointInput'),
          responses: { '200': { description: 'Updated endpoint' } },
        },
        delete: {
          summary: 'Delete endpoint',
          parameters: [pathParam('token')],
          responses: { '204': { description: 'Deleted' } },
        },
      },
      '/t/{token}': {
        post: {
          security: [],
          summary: 'Capture webhook',
          parameters: [pathParam('token')],
          responses: { '200': { description: 'Endpoint custom response' } },
        },
      },
      '/api/requests': {
        get: {
          summary: 'List captured requests',
          parameters: [
            queryParam('token'),
            queryParam('method'),
            queryParam('status'),
            queryParam('q'),
            queryParam('since'),
            queryParam('limit'),
          ],
          responses: { '200': { description: 'Request list' } },
        },
      },
      '/api/requests/{id}': {
        get: { summary: 'Get captured request', parameters: [pathParam('id')], responses: { '200': { description: 'Request' } } },
      },
      '/api/requests/{id}/replay': {
        post: {
          summary: 'Replay request',
          parameters: [pathParam('id')],
          requestBody: jsonBodyRef('ReplayInput'),
          responses: { '200': { description: 'Replay result' } },
        },
      },
      '/api/events/{token}': {
        get: {
          summary: 'SSE stream',
          parameters: [pathParam('token'), queryParam('auth')],
          responses: { '200': { description: 'text/event-stream' } },
        },
      },
      '/api/replays': { get: { summary: 'List replays', responses: { '200': { description: 'Replay list' } } } },
      '/api/api-keys': {
        get: { summary: 'List API keys', responses: { '200': { description: 'API key list' } } },
        post: { summary: 'Create API key', responses: { '201': { description: 'API key secret and metadata' } } },
      },
      '/api/api-keys/{id}': {
        delete: { summary: 'Revoke API key', parameters: [pathParam('id')], responses: { '204': { description: 'Revoked' } } },
      },
      '/api/team/members': { get: { summary: 'List team members', responses: { '200': { description: 'Members' } } } },
      '/api/team/invites': { post: { summary: 'Invite member', responses: { '201': { description: 'Invite' } } } },
      '/api/team/members/{id}': {
        patch: { summary: 'Update member role', parameters: [pathParam('id')], responses: { '200': { description: 'Updated' } } },
      },
      '/api/notifications/preferences': {
        get: { summary: 'Get notification preferences', responses: { '200': { description: 'Preferences' } } },
        patch: { summary: 'Update notification preferences', responses: { '200': { description: 'Preferences' } } },
      },
      '/api/notifications/events': {
        get: { summary: 'List notification events', responses: { '200': { description: 'Notification events' } } },
      },
    },
  }
}

function jsonBodyRef(schema: string) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${schema}` },
      },
    },
  }
}

function pathParam(name: string) {
  return { name, in: 'path', required: true, schema: { type: 'string' } }
}

function queryParam(name: string) {
  return { name, in: 'query', required: false, schema: { type: 'string' } }
}

async function principalFor(ctx: HttpContext): Promise<AuthPrincipal> {
  const token = bearerToken(ctx) ?? stringParam(ctx.request.qs().auth)
  const authenticated = await store.authenticateToken(token)

  if (authenticated) {
    return authenticated
  }

  return {
    kind: 'anonymous',
    teamId: DEFAULT_TEAM_ID,
    role: 'Owner',
  }
}

async function requirePrincipal(ctx: HttpContext, roles: Array<AuthPrincipal['role']> = ['Owner', 'Admin', 'Member']) {
  const principal = await principalFor(ctx)

  if (env.get('AUTH_REQUIRED') && principal.kind === 'anonymous') {
    ctx.response.unauthorized({ error: 'Authentication required' })
    return null
  }

  if (!roles.includes(principal.role)) {
    ctx.response.forbidden({ error: 'Insufficient role' })
    return null
  }

  return principal
}

function bearerToken(ctx: HttpContext) {
  const header = ctx.request.header('authorization')
  if (!header?.toLowerCase().startsWith('bearer ')) {
    return undefined
  }

  return header.slice('bearer '.length).trim()
}

function endpointUrl(token: string) {
  const baseUrl = env.get('APP_URL') ?? `http://${env.get('HOST')}:${env.get('PORT')}`
  return `${baseUrl.replace(/\/$/, '')}/t/${token}`
}

function eventStreamCorsHeaders(ctx: HttpContext): Record<string, string> {
  const origin = ctx.request.header('origin')

  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '*',
    }
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

function capturedPath(url: string, token: string) {
  const prefix = `/t/${token}`
  const withoutPrefix = url.startsWith(prefix) ? url.slice(prefix.length) : url
  return withoutPrefix || '/'
}

function isRateLimited(token: string) {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(token)

  if (!bucket || now - bucket.windowStartedAt > 60_000) {
    rateLimitBuckets.set(token, { windowStartedAt: now, count: 1 })
    return false
  }

  bucket.count += 1
  return bucket.count > RATE_LIMIT_PER_MINUTE
}

function stringParam(value: unknown) {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined
  }

  return value ? String(value) : undefined
}

function numberParam(value: unknown) {
  const stringValue = stringParam(value)
  const numberValue = stringValue ? Number.parseInt(stringValue, 10) : undefined
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function handleRouteError(ctx: HttpContext, error: unknown) {
  const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 500
  const message = error instanceof Error ? error.message : 'Unexpected error'

  return ctx.response.status(status || 500).send({ error: message })
}
