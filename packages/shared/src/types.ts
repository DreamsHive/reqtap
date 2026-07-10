/** Shared types used by server, web and CLI. */

export interface Endpoint {
  id: string
  token: string
  name: string
  slug?: string
  provider?: WebhookProvider
  isActive: boolean
  responseConfig: ResponseConfig
  retentionDays: number
  expiresAt?: string
  createdAt: string
}

export interface ResponseConfig {
  status: number
  body?: string
  headers?: Record<string, string>
}

export type WebhookProvider = 'stripe' | 'github'

export interface WebhookRequest {
  id: string
  endpointId: string
  method: string
  path: string
  query: Record<string, string>
  headers: Record<string, string>
  bodyRaw: string
  bodySize: number
  contentType?: string
  ip: string
  provider?: WebhookProvider
  signatureValid?: boolean
  createdAt: string
}

export interface Replay {
  id: string
  requestId: string
  targetUrl: string
  resultStatus?: number
  latencyMs?: number
  error?: string
  createdAt: string
}

/** Events pushed over the WebSocket channel `endpoint:<token>` */
export type WSEvent =
  | { type: 'request.new'; data: WebhookRequest }
  | { type: 'replay.result'; data: Replay }
