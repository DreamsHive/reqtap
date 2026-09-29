import type { WebhookRequest } from '@reqtap/shared'

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

export interface ReplayResult {
  targetUrl: string
  resultStatus?: number
  latencyMs?: number
  error?: string
}

export async function sendReplay(request: WebhookRequest, target: string): Promise<ReplayResult> {
  const targetUrl = buildTargetUrl(target, request)
  const headers = forwardHeaders(request.headers)
  const started = performance.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : Buffer.from(request.bodyBase64, 'base64'),
      signal: controller.signal,
    })

    return {
      targetUrl,
      resultStatus: response.status,
      latencyMs: Math.round(performance.now() - started),
    }
  } catch (error) {
    return {
      targetUrl,
      latencyMs: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : 'Replay failed',
    }
  } finally {
    clearTimeout(timeout)
  }
}

export function buildTargetUrl(target: string, request: Pick<WebhookRequest, 'path' | 'query'>) {
  const normalized = target.includes('://') ? target : `http://${target}`
  const url = new URL(normalized)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw invalidTarget('Replay target must use http or https')
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

export function forwardHeaders(headers: Record<string, string>) {
  const forwarded = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue
    }

    forwarded.set(key, value)
  }

  forwarded.set('x-reqtap-replay', 'true')
  return forwarded
}

function invalidTarget(message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = 422
  return error
}
