/** Shared types used by server, web and CLI. */

export interface Endpoint {
  id: string
  token: string
  name: string
  slug?: string
  provider?: WebhookProvider
  signingSecretConfigured?: boolean
  isActive: boolean
  responseConfig: ResponseConfig
  retentionDays: number
  teamId?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
  requestCount?: number
  lastRequestAt?: string
}

export interface ResponseConfig {
  status: number
  body?: string
  headers?: Record<string, string>
}

export type WebhookProvider = 'stripe' | 'github' | 'shopify' | 'clerk'

export type SignatureStatus = 'verified' | 'invalid' | 'missing_secret' | 'not_detected'

export interface WebhookRequest {
  id: string
  endpointId: string
  token: string
  method: string
  path: string
  query: Record<string, string>
  headers: Record<string, string>
  bodyRaw: string
  bodyBase64: string
  bodySize: number
  contentType?: string
  ip: string
  provider?: WebhookProvider
  signatureStatus: SignatureStatus
  signatureValid?: boolean
  responseStatus: number
  latencyMs: number
  createdAt: string
}

export interface Replay {
  id: string
  requestId: string
  request?: Pick<WebhookRequest, 'method' | 'path' | 'createdAt'>
  targetUrl: string
  resultStatus?: number
  latencyMs?: number
  error?: string
  createdAt: string
}

export type TeamRole = 'Owner' | 'Admin' | 'Member'

export interface AuthUser {
  id: string
  teamId: string
  name: string
  email: string
  role: TeamRole
  createdAt: string
}

export interface ApiKey {
  id: string
  teamId: string
  name: string
  prefix: string
  last4: string
  createdAt: string
  lastUsedAt?: string
  revokedAt?: string
}

export interface TeamMember {
  id: string
  teamId: string
  name: string
  email: string
  role: TeamRole
  pending: boolean
  createdAt: string
}

export interface TeamInvite {
  id: string
  teamId: string
  email: string
  role: TeamRole
  message?: string
  status: 'pending' | 'accepted' | 'revoked'
  createdAt: string
}

export interface NotificationPreferences {
  teamId: string
  failedWebhookAlerts: boolean
  signatureFailures: boolean
  endpointQuiet: boolean
  weeklySummary: boolean
  productUpdates: boolean
  updatedAt: string
}

export interface NotificationEvent {
  id: string
  teamId: string
  type: 'forward_failed' | 'signature_failed' | 'endpoint_quiet' | 'system'
  title: string
  body: string
  createdAt: string
  readAt?: string
}

/** Events pushed over the live channel for `endpoint:<token>` */
export type WSEvent =
  | { type: 'request.new'; data: WebhookRequest }
  | { type: 'replay.result'; data: Replay }
