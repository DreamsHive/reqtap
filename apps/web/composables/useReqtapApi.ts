import type { Endpoint, Replay, SignatureStatus, WebhookRequest } from '@reqtap/shared'

export interface ApiList<T> {
  data: T[]
}

export interface ApiItem<T> {
  data: T
}

export interface OverviewStats {
  totalRequests: number
  activeEndpoints: number
  successRate: number
  averageLatencyMs: number
  topEndpoints: Array<{ token: string; name: string; count: number }>
  statusCodes: Record<string, number>
}

export function useApiBase() {
  const config = useRuntimeConfig()
  return String(config.public.apiBase).replace(/\/$/, '')
}

export function apiUrl(path: string) {
  return `${useApiBase()}${path}`
}

export function endpointUrl(token: string) {
  return `${useApiBase()}/t/${token}`
}

export function getAuthToken() {
  if (!import.meta.client) {
    return ''
  }

  return window.localStorage.getItem('reqtap_token') ?? ''
}

export function setAuthToken(token: string) {
  if (import.meta.client) {
    window.localStorage.setItem('reqtap_token', token)
  }
}

export function clearAuthToken() {
  if (import.meta.client) {
    window.localStorage.removeItem('reqtap_token')
  }
}

export function authHeaders() {
  const token = getAuthToken()
  const headers: Record<string, string> = {}

  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  return headers
}

export function authFetch<T>(path: string, options: Record<string, any> = {}) {
  return $fetch<T>(apiUrl(path), {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options?.headers as Record<string, string> | undefined),
    },
  })
}

export function formatRelativeTime(input?: string) {
  if (!input) {
    return '-'
  }

  const elapsed = Date.now() - new Date(input).getTime()
  const seconds = Math.max(0, Math.floor(elapsed / 1000))

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  return `${Math.floor(hours / 24)}d ago`
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function prettyBody(request?: WebhookRequest) {
  if (!request?.bodyRaw) {
    return ''
  }

  if (request.contentType?.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(request.bodyRaw), null, 2)
    } catch {
      return request.bodyRaw
    }
  }

  return request.bodyRaw
}

export function signatureText(status: SignatureStatus) {
  const labels: Record<SignatureStatus, string> = {
    verified: 'Signature verified',
    invalid: 'Invalid signature',
    missing_secret: 'Signing secret missing',
    not_detected: 'No signature detected',
  }

  return labels[status]
}

export function signatureTone(status: SignatureStatus) {
  return status === 'verified' ? 'success' : status === 'not_detected' ? 'neutral' : 'danger'
}

export type { Endpoint, Replay, WebhookRequest }
