import type { WebhookRequest } from '@reqtap/shared'
import type { CliConfig } from './config.js'

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'upgrade',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'accept-encoding',
])

export async function apiRequest<T>(
  config: CliConfig,
  path: string,
  init: RequestInit & { json?: Record<string, any> } = {}
): Promise<T> {
  const headers = new Headers(init.headers)

  if (config.apiKey) {
    headers.set('authorization', `Bearer ${config.apiKey}`)
  }

  if (init.json) {
    headers.set('content-type', 'application/json')
  }

  const response = await fetch(`${config.apiBase}${path}`, {
    ...init,
    headers,
    body: init.json ? JSON.stringify(init.json) : init.body,
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : undefined

  if (!response.ok) {
    throw new Error(body?.error ?? `${response.status} ${response.statusText}`)
  }

  return body as T
}

export async function forwardWebhook(request: WebhookRequest, target: string) {
  const targetUrl = buildTargetUrl(target, request)
  const started = performance.now()
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders(request.headers),
    body: ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : Buffer.from(request.bodyBase64, 'base64'),
  })

  return {
    targetUrl,
    status: response.status,
    latencyMs: Math.round(performance.now() - started),
  }
}

export function buildTargetUrl(target: string, request: Pick<WebhookRequest, 'path' | 'query'>) {
  const normalized = target.includes('://') ? target : `http://${target}`
  const url = new URL(normalized)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Target must use http or https')
  }

  if ((!url.pathname || url.pathname === '/') && request.path && request.path !== '/') {
    url.pathname = request.path
  }

  if (!url.search) {
    for (const [key, value] of Object.entries(request.query)) {
      url.searchParams.append(key, value)
    }
  }

  return url.toString()
}

function forwardHeaders(headers: Record<string, string>) {
  const forwarded = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue
    }

    forwarded.set(key, value)
  }

  forwarded.set('x-reqtap-forwarded', 'true')
  return forwarded
}
