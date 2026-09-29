import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import env from '#start/env'
import { MongoClient, type Collection, type Db } from 'mongodb'
import type {
  Endpoint,
  ApiKey,
  AuthUser,
  NotificationEvent,
  NotificationPreferences,
  Replay,
  ResponseConfig,
  TeamInvite,
  TeamMember,
  TeamRole,
  WebhookProvider,
  WebhookRequest,
} from '@reqtap/shared'

type StoredEndpoint = Endpoint & {
  _id: string
  signingSecret?: string
}

type StoredRequest = WebhookRequest & {
  _id: string
  teamId: string
  expiresAt: Date
}

type StoredReplay = Replay & {
  _id: string
  teamId: string
}

type StoredUser = AuthUser & {
  _id: string
  passwordHash: string
}

type StoredSession = {
  _id: string
  id: string
  userId: string
  teamId: string
  tokenHash: string
  createdAt: string
  lastUsedAt?: string
}

type StoredPasswordReset = {
  _id: string
  id: string
  userId: string
  email: string
  tokenHash: string
  expiresAt: Date
  createdAt: string
  usedAt?: string
}

type StoredApiKey = ApiKey & {
  _id: string
  keyHash: string
}

type StoredTeamInvite = TeamInvite & {
  _id: string
}

type StoredNotificationPreferences = NotificationPreferences & {
  _id: string
}

type StoredNotificationEvent = NotificationEvent & {
  _id: string
}

export interface AuthPrincipal {
  kind: 'user' | 'api_key' | 'anonymous'
  user?: AuthUser
  apiKey?: ApiKey
  teamId: string
  role: TeamRole
}

export interface EndpointInput {
  teamId?: string
  name?: string
  slug?: string
  provider?: WebhookProvider
  signingSecret?: string
  responseConfig?: Partial<ResponseConfig>
  retentionDays?: number
  isActive?: boolean
}

export interface RequestFilters {
  teamId?: string
  token?: string
  method?: string
  status?: string
  q?: string
  since?: string
  limit?: number
}

export interface OverviewStats {
  totalRequests: number
  activeEndpoints: number
  successRate: number
  averageLatencyMs: number
  topEndpoints: Array<{ token: string; name: string; count: number }>
  statusCodes: Record<string, number>
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  inviteId?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  token: string
  user: AuthUser
}

export interface PasswordResetRequest {
  email: string
  token: string
  user: AuthUser
  expiresAt: string
}

export interface CreateApiKeyInput {
  teamId: string
  name?: string
}

export interface CreateApiKeyResult {
  key: string
  data: ApiKey
}

export interface CreateInviteInput {
  teamId: string
  email: string
  role?: TeamRole
  message?: string
}

export type NotificationPreferenceKey =
  | 'failedWebhookAlerts'
  | 'signatureFailures'
  | 'endpointQuiet'
  | 'weeklySummary'
  | 'productUpdates'

const DEFAULT_RESPONSE: ResponseConfig = {
  status: 200,
  body: JSON.stringify({ received: true }),
  headers: { 'content-type': 'application/json' },
}
export const DEFAULT_TEAM_ID = 'self-host'

class ReqtapStore {
  #client?: MongoClient
  #db?: Db
  #connectPromise?: Promise<void>
  #backend: 'mongo' | 'memory' = 'memory'

  #memory = {
    endpoints: [] as StoredEndpoint[],
    requests: [] as StoredRequest[],
    replays: [] as StoredReplay[],
    users: [] as StoredUser[],
    sessions: [] as StoredSession[],
    passwordResets: [] as StoredPasswordReset[],
    apiKeys: [] as StoredApiKey[],
    invites: [] as StoredTeamInvite[],
    notificationPreferences: [] as StoredNotificationPreferences[],
    notificationEvents: [] as StoredNotificationEvent[],
  }

  get mode() {
    return this.#backend
  }

  async health() {
    await this.#ensureConnected()

    return {
      storage: this.#backend,
      connected: this.#backend === 'memory' || Boolean(this.#db),
    }
  }

  async hasUsers() {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      return (await this.#users().countDocuments({})) > 0
    }

    return this.#memory.users.length > 0
  }

  async registerUser(input: RegisterInput): Promise<AuthResult> {
    await this.#ensureConnected()

    const email = normalizeEmail(input.email)
    const existing = await this.#findUserByEmail(email)
    const invite = input.inviteId ? await this.#findInviteById(input.inviteId) : null

    if (existing) {
      throw conflict('A user with that email already exists')
    }

    if (input.inviteId && !invite) {
      const error = new Error('Invite not found') as Error & { status: number }
      error.status = 404
      throw error
    }

    if (invite && invite.status !== 'pending') {
      const error = new Error('Invite is no longer pending') as Error & { status: number }
      error.status = 409
      throw error
    }

    if (invite && invite.email !== email) {
      const error = new Error('Invite email does not match this account') as Error & { status: number }
      error.status = 422
      throw error
    }

    if (!input.password || input.password.length < 8) {
      const error = new Error('Password must be at least 8 characters') as Error & { status: number }
      error.status = 422
      throw error
    }

    const now = new Date().toISOString()
    const firstUser = !(await this.hasUsers())
    const user: StoredUser = {
      _id: randomUUID(),
      id: randomUUID(),
      teamId: invite?.teamId ?? (firstUser ? DEFAULT_TEAM_ID : randomUUID()),
      name: input.name?.trim() || email.split('@')[0],
      email,
      role: invite?.role ?? 'Owner',
      passwordHash: hashPassword(input.password),
      createdAt: now,
    }

    if (this.#backend === 'mongo') {
      await this.#users().insertOne(user)
    } else {
      this.#memory.users.push(user)
    }

    if (invite) {
      await this.#acceptInvite(invite.id)
    }

    await this.#ensureDefaultNotificationPreferences(user.teamId)
    return this.#createSession(user)
  }

  async loginUser(input: LoginInput): Promise<AuthResult> {
    await this.#ensureConnected()

    const user = await this.#findUserByEmail(normalizeEmail(input.email))

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      const error = new Error('Invalid email or password') as Error & { status: number }
      error.status = 401
      throw error
    }

    return this.#createSession(user)
  }

  async createPasswordReset(emailInput: string): Promise<PasswordResetRequest | null> {
    await this.#ensureConnected()

    const user = await this.#findUserByEmail(normalizeEmail(emailInput))
    if (!user) {
      return null
    }

    const token = `rqr_${randomBytes(32).toString('base64url')}`
    const now = new Date()
    const reset: StoredPasswordReset = {
      _id: randomUUID(),
      id: randomUUID(),
      userId: user.id,
      email: user.email,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + 60 * 60_000),
      createdAt: now.toISOString(),
    }

    if (this.#backend === 'mongo') {
      await this.#passwordResets().deleteMany({ userId: user.id, usedAt: { $exists: false } })
      await this.#passwordResets().insertOne(reset)
    } else {
      this.#memory.passwordResets = this.#memory.passwordResets.filter(
        (item) => item.userId !== user.id || item.usedAt
      )
      this.#memory.passwordResets.unshift(reset)
    }

    return {
      email: user.email,
      token,
      user: publicUser(user),
      expiresAt: reset.expiresAt.toISOString(),
    }
  }

  async resetPassword(token: string, password: string) {
    await this.#ensureConnected()

    if (!password || password.length < 8) {
      const error = new Error('Password must be at least 8 characters') as Error & { status: number }
      error.status = 422
      throw error
    }

    const tokenHash = hashToken(token)
    const now = new Date()

    if (this.#backend === 'mongo') {
      const reset = await this.#passwordResets().findOne({
        tokenHash,
        usedAt: { $exists: false },
        expiresAt: { $gt: now },
      })

      if (!reset) {
        const error = new Error('Reset link is invalid or expired') as Error & { status: number }
        error.status = 422
        throw error
      }

      await this.#users().updateOne({ id: reset.userId }, { $set: { passwordHash: hashPassword(password) } })
      await this.#passwordResets().updateOne({ id: reset.id }, { $set: { usedAt: now.toISOString() } })
      await this.#sessions().deleteMany({ userId: reset.userId })
      return true
    }

    const reset = this.#memory.passwordResets.find(
      (item) => item.tokenHash === tokenHash && !item.usedAt && item.expiresAt > now
    )

    if (!reset) {
      const error = new Error('Reset link is invalid or expired') as Error & { status: number }
      error.status = 422
      throw error
    }

    const user = this.#memory.users.find((item) => item.id === reset.userId)
    if (!user) {
      const error = new Error('Reset link is invalid or expired') as Error & { status: number }
      error.status = 422
      throw error
    }

    user.passwordHash = hashPassword(password)
    reset.usedAt = now.toISOString()
    this.#memory.sessions = this.#memory.sessions.filter((item) => item.userId !== reset.userId)
    return true
  }

  async authenticateToken(token?: string | null): Promise<AuthPrincipal | null> {
    await this.#ensureConnected()

    if (!token) {
      return null
    }

    const tokenHash = hashToken(token)

    if (this.#backend === 'mongo') {
      const session = await this.#sessions().findOne({ tokenHash })
      if (session) {
        await this.#sessions().updateOne({ id: session.id }, { $set: { lastUsedAt: new Date().toISOString() } })
        const user = await this.#users().findOne({ id: session.userId })
        return user
          ? {
              kind: 'user',
              user: publicUser(user),
              teamId: user.teamId,
              role: user.role,
            }
          : null
      }

      const apiKey = await this.#apiKeys().findOne({ keyHash: tokenHash, revokedAt: { $exists: false } })
      if (apiKey) {
        await this.#apiKeys().updateOne({ id: apiKey.id }, { $set: { lastUsedAt: new Date().toISOString() } })
        return {
          kind: 'api_key',
          apiKey: publicApiKey({ ...apiKey, lastUsedAt: new Date().toISOString() }),
          teamId: apiKey.teamId,
          role: 'Admin',
        }
      }

      return null
    }

    const session = this.#memory.sessions.find((item) => item.tokenHash === tokenHash)
    if (session) {
      session.lastUsedAt = new Date().toISOString()
      const user = this.#memory.users.find((item) => item.id === session.userId)
      return user ? { kind: 'user', user: publicUser(user), teamId: user.teamId, role: user.role } : null
    }

    const apiKey = this.#memory.apiKeys.find((item) => item.keyHash === tokenHash && !item.revokedAt)
    if (apiKey) {
      apiKey.lastUsedAt = new Date().toISOString()
      return { kind: 'api_key', apiKey: publicApiKey(apiKey), teamId: apiKey.teamId, role: 'Admin' }
    }

    return null
  }

  async listApiKeys(teamId: string): Promise<ApiKey[]> {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      const docs = await this.#apiKeys().find({ teamId, revokedAt: { $exists: false } }).sort({ createdAt: -1 }).toArray()
      return docs.map(publicApiKey)
    }

    return this.#memory.apiKeys.filter((key) => key.teamId === teamId && !key.revokedAt).map(publicApiKey)
  }

  async createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
    await this.#ensureConnected()

    const now = new Date().toISOString()
    const key = `rqx_live_${randomBytes(24).toString('base64url')}`
    const apiKey: StoredApiKey = {
      _id: randomUUID(),
      id: randomUUID(),
      teamId: input.teamId,
      name: input.name?.trim() || 'Untitled key',
      prefix: 'rqx_live',
      last4: key.slice(-4),
      keyHash: hashToken(key),
      createdAt: now,
    }

    if (this.#backend === 'mongo') {
      await this.#apiKeys().insertOne(apiKey)
    } else {
      this.#memory.apiKeys.unshift(apiKey)
    }

    return { key, data: publicApiKey(apiKey) }
  }

  async revokeApiKey(teamId: string, id: string) {
    await this.#ensureConnected()
    const now = new Date().toISOString()

    if (this.#backend === 'mongo') {
      const result = await this.#apiKeys().updateOne({ teamId, id }, { $set: { revokedAt: now } })
      return result.matchedCount > 0
    }

    const key = this.#memory.apiKeys.find((item) => item.teamId === teamId && item.id === id)
    if (!key) {
      return false
    }

    key.revokedAt = now
    return true
  }

  async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    await this.#ensureConnected()

    const users =
      this.#backend === 'mongo'
        ? await this.#users().find({ teamId }).sort({ createdAt: 1 }).toArray()
        : this.#memory.users.filter((user) => user.teamId === teamId)

    const invites =
      this.#backend === 'mongo'
        ? await this.#invites().find({ teamId, status: 'pending' }).sort({ createdAt: -1 }).toArray()
        : this.#memory.invites.filter((invite) => invite.teamId === teamId && invite.status === 'pending')

    return [
      ...users.map((user) => ({
        id: user.id,
        teamId: user.teamId,
        name: user.name,
        email: user.email,
        role: user.role,
        pending: false,
        createdAt: user.createdAt,
      })),
      ...invites.map((invite) => ({
        id: invite.id,
        teamId: invite.teamId,
        name: invite.email,
        email: 'Invitation pending',
        role: invite.role,
        pending: true,
        createdAt: invite.createdAt,
      })),
    ]
  }

  async createTeamInvite(input: CreateInviteInput): Promise<TeamInvite> {
    await this.#ensureConnected()

    const invite: StoredTeamInvite = {
      _id: randomUUID(),
      id: randomUUID(),
      teamId: input.teamId,
      email: normalizeEmail(input.email),
      role: normalizeRole(input.role),
      message: input.message?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    if (this.#backend === 'mongo') {
      await this.#invites().insertOne(invite)
    } else {
      this.#memory.invites.unshift(invite)
    }

    await this.createNotificationEvent(input.teamId, {
      type: 'system',
      title: 'Team invite created',
      body: `${invite.email} was invited as ${invite.role}.`,
    })

    return publicInvite(invite)
  }

  async updateTeamMemberRole(teamId: string, id: string, role: TeamRole) {
    await this.#ensureConnected()
    const normalizedRole = normalizeRole(role)

    if (this.#backend === 'mongo') {
      const result = await this.#users().updateOne({ teamId, id }, { $set: { role: normalizedRole } })
      return result.matchedCount > 0
    }

    const user = this.#memory.users.find((item) => item.teamId === teamId && item.id === id)
    if (!user) {
      return false
    }

    user.role = normalizedRole
    return true
  }

  async getNotificationPreferences(teamId: string): Promise<NotificationPreferences> {
    await this.#ensureConnected()
    return this.#ensureDefaultNotificationPreferences(teamId)
  }

  async updateNotificationPreferences(
    teamId: string,
    input: Partial<Omit<NotificationPreferences, 'teamId' | 'updatedAt'>>
  ): Promise<NotificationPreferences> {
    await this.#ensureConnected()

    const current = await this.#ensureDefaultNotificationPreferences(teamId)
    const next: StoredNotificationPreferences = {
      ...current,
      _id: randomUUID(),
      failedWebhookAlerts: input.failedWebhookAlerts ?? current.failedWebhookAlerts,
      signatureFailures: input.signatureFailures ?? current.signatureFailures,
      endpointQuiet: input.endpointQuiet ?? current.endpointQuiet,
      weeklySummary: input.weeklySummary ?? current.weeklySummary,
      productUpdates: input.productUpdates ?? current.productUpdates,
      updatedAt: new Date().toISOString(),
    }

    if (this.#backend === 'mongo') {
      const { _id: _id, ...safeNext } = next
      await this.#notificationPreferences().updateOne({ teamId }, { $set: safeNext }, { upsert: true })
    } else {
      const index = this.#memory.notificationPreferences.findIndex((item) => item.teamId === teamId)
      if (index >= 0) {
        this.#memory.notificationPreferences[index] = next
      } else {
        this.#memory.notificationPreferences.push(next)
      }
    }

    return publicNotificationPreferences(next)
  }

  async listNotificationEvents(teamId: string, limit = 50): Promise<NotificationEvent[]> {
    await this.#ensureConnected()
    const cappedLimit = Math.min(Math.max(limit, 1), 100)

    if (this.#backend === 'mongo') {
      const docs = await this.#notificationEvents().find({ teamId }).sort({ createdAt: -1 }).limit(cappedLimit).toArray()
      return docs.map(publicNotificationEvent)
    }

    return this.#memory.notificationEvents
      .filter((event) => event.teamId === teamId)
      .slice(0, cappedLimit)
      .map(publicNotificationEvent)
  }

  async createNotificationEvent(
    teamId: string,
    input: Pick<NotificationEvent, 'type' | 'title' | 'body'>
  ): Promise<NotificationEvent> {
    await this.#ensureConnected()

    const event: StoredNotificationEvent = {
      _id: randomUUID(),
      id: randomUUID(),
      teamId,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: new Date().toISOString(),
    }

    if (this.#backend === 'mongo') {
      await this.#notificationEvents().insertOne(event)
    } else {
      this.#memory.notificationEvents.unshift(event)
    }

    return publicNotificationEvent(event)
  }

  async createEndpoint(input: EndpointInput = {}): Promise<Endpoint> {
    await this.#ensureConnected()

    const now = new Date().toISOString()
    const slug = sanitizeSlug(input.slug)
    const token = slug || randomToken()
    const endpoint: StoredEndpoint = {
      _id: randomUUID(),
      id: randomUUID(),
      token,
      slug: slug || undefined,
      name: input.name?.trim() || slug || `endpoint-${token.slice(0, 6)}`,
      provider: normalizeProvider(input.provider),
      signingSecret: input.signingSecret?.trim() || undefined,
      signingSecretConfigured: Boolean(input.signingSecret?.trim()),
      isActive: input.isActive ?? true,
      teamId: input.teamId ?? DEFAULT_TEAM_ID,
      responseConfig: normalizeResponseConfig(input.responseConfig),
      retentionDays: clampRetention(input.retentionDays),
      createdAt: now,
      updatedAt: now,
      requestCount: 0,
    }

    if (this.#backend === 'mongo') {
      try {
        await this.#endpoints().insertOne(endpoint)
      } catch (error) {
        if (isDuplicateKey(error)) {
          throw conflict(`Endpoint token "${token}" already exists`)
        }

        throw error
      }
    } else {
      if (this.#memory.endpoints.some((item) => item.token === token)) {
        throw conflict(`Endpoint token "${token}" already exists`)
      }

      this.#memory.endpoints.unshift(endpoint)
    }

    return publicEndpoint(endpoint)
  }

  async listEndpoints(teamId?: string): Promise<Endpoint[]> {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      const docs = await this.#endpoints()
        .find(teamId ? { teamId } : {})
        .sort({ createdAt: -1 })
        .toArray()
      return docs.map(publicEndpoint)
    }

    return this.#memory.endpoints
      .filter((endpoint) => !teamId || endpoint.teamId === teamId)
      .map(publicEndpoint)
  }

  async findEndpointByToken(token: string, teamId?: string): Promise<StoredEndpoint | null> {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      return this.#endpoints().findOne(teamId ? { token, teamId } : { token })
    }

    return (
      this.#memory.endpoints.find((endpoint) => endpoint.token === token && (!teamId || endpoint.teamId === teamId)) ??
      null
    )
  }

  async updateEndpoint(token: string, input: EndpointInput, teamId?: string): Promise<Endpoint | null> {
    await this.#ensureConnected()

    const patch: Partial<StoredEndpoint> = {
      updatedAt: new Date().toISOString(),
    }

    if (typeof input.name === 'string') {
      patch.name = input.name.trim()
    }

    if (typeof input.provider === 'string') {
      patch.provider = normalizeProvider(input.provider)
    }

    if (typeof input.signingSecret === 'string') {
      patch.signingSecret = input.signingSecret.trim() || undefined
      patch.signingSecretConfigured = Boolean(input.signingSecret.trim())
    }

    if (typeof input.retentionDays === 'number') {
      patch.retentionDays = clampRetention(input.retentionDays)
    }

    if (typeof input.isActive === 'boolean') {
      patch.isActive = input.isActive
    }

    if (input.responseConfig) {
      const existing = await this.findEndpointByToken(token, teamId)
      if (!existing) {
        return null
      }

      patch.responseConfig = normalizeResponseConfig({
        ...existing.responseConfig,
        ...input.responseConfig,
        headers: {
          ...existing.responseConfig.headers,
          ...input.responseConfig.headers,
        },
      })
    }

    if (this.#backend === 'mongo') {
      const result = await this.#endpoints().findOneAndUpdate(
        teamId ? { token, teamId } : { token },
        { $set: patch },
        { returnDocument: 'after' }
      )
      return result ? publicEndpoint(result) : null
    }

    const endpoint = this.#memory.endpoints.find((item) => item.token === token && (!teamId || item.teamId === teamId))
    if (!endpoint) {
      return null
    }

    Object.assign(endpoint, patch)
    return publicEndpoint(endpoint)
  }

  async deleteEndpoint(token: string, teamId?: string): Promise<boolean> {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      const result = await this.#endpoints().deleteOne(teamId ? { token, teamId } : { token })
      await this.#requests().deleteMany(teamId ? { token, teamId } : { token })
      await this.#replays().deleteMany(teamId ? { token, teamId } : { token })
      return result.deletedCount > 0
    }

    const before = this.#memory.endpoints.length
    const deletedRequestIds = new Set(
      this.#memory.requests
        .filter((item) => item.token === token && (!teamId || item.teamId === teamId))
        .map((item) => item.id)
    )
    this.#memory.endpoints = this.#memory.endpoints.filter(
      (item) => item.token !== token || (teamId ? item.teamId !== teamId : false)
    )
    this.#memory.requests = this.#memory.requests.filter(
      (item) => item.token !== token || (teamId ? item.teamId !== teamId : false)
    )
    this.#memory.replays = this.#memory.replays.filter((item) => !deletedRequestIds.has(item.requestId))
    return this.#memory.endpoints.length !== before
  }

  async saveRequest(endpoint: StoredEndpoint, input: Omit<WebhookRequest, 'id' | 'endpointId'>) {
    await this.#ensureConnected()

    const now = new Date(input.createdAt)
    const request: StoredRequest = {
      ...input,
      _id: randomUUID(),
      id: randomUUID(),
      endpointId: endpoint.id,
      teamId: endpoint.teamId ?? DEFAULT_TEAM_ID,
      expiresAt: new Date(now.getTime() + endpoint.retentionDays * 86_400_000),
    }

    if (this.#backend === 'mongo') {
      await this.#requests().insertOne(request)
      await this.#endpoints().updateOne(
        { token: endpoint.token },
        {
          $inc: { requestCount: 1 },
          $set: { lastRequestAt: request.createdAt, updatedAt: request.createdAt },
        }
      )
    } else {
      this.#memory.requests.unshift(request)
      const memoryEndpoint = this.#memory.endpoints.find((item) => item.token === endpoint.token)
      if (memoryEndpoint) {
        memoryEndpoint.requestCount = (memoryEndpoint.requestCount ?? 0) + 1
        memoryEndpoint.lastRequestAt = request.createdAt
        memoryEndpoint.updatedAt = request.createdAt
      }
    }

    return publicRequest(request)
  }

  async listRequests(filters: RequestFilters = {}): Promise<WebhookRequest[]> {
    await this.#ensureConnected()

    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200)

    if (this.#backend === 'mongo') {
      const query = requestMongoQuery(filters)
      const docs = await this.#requests().find(query).sort({ createdAt: -1 }).limit(limit).toArray()
      return docs.map(publicRequest)
    }

    return this.#memory.requests
      .filter((request) => requestMatches(request, filters))
      .slice(0, limit)
      .map(publicRequest)
  }

  async findRequestById(id: string, teamId?: string): Promise<WebhookRequest | null> {
    await this.#ensureConnected()

    if (this.#backend === 'mongo') {
      const request = await this.#requests().findOne(teamId ? { id, teamId } : { id })
      return request ? publicRequest(request) : null
    }

    const request = this.#memory.requests.find((item) => item.id === id && (!teamId || item.teamId === teamId))
    return request ? publicRequest(request) : null
  }

  async saveReplay(input: Omit<Replay, 'id' | 'createdAt'> & { createdAt?: string; teamId?: string }) {
    await this.#ensureConnected()

    const replay: StoredReplay = {
      ...input,
      _id: randomUUID(),
      id: randomUUID(),
      teamId: input.teamId ?? DEFAULT_TEAM_ID,
      createdAt: input.createdAt ?? new Date().toISOString(),
    }

    if (this.#backend === 'mongo') {
      await this.#replays().insertOne(replay)
    } else {
      this.#memory.replays.unshift(replay)
    }

    return publicReplay(replay)
  }

  async listReplays(limit = 50, teamId?: string): Promise<Replay[]> {
    await this.#ensureConnected()

    const cappedLimit = Math.min(Math.max(limit, 1), 200)

    if (this.#backend === 'mongo') {
      const replays = await this.#replays()
        .find(teamId ? { teamId } : {})
        .sort({ createdAt: -1 })
        .limit(cappedLimit)
        .toArray()
      const requestIds = replays.map((replay) => replay.requestId)
      const requests = await this.#requests()
        .find({ id: { $in: requestIds } })
        .project({ id: 1, method: 1, path: 1, createdAt: 1 })
        .toArray()
      const requestById = new Map(
        requests.map((request) => [
          request.id,
          request as Pick<WebhookRequest, 'method' | 'path' | 'createdAt'>,
        ])
      )

      return replays.map((replay) => publicReplay(replay, requestById.get(replay.requestId)))
    }

    const requestById = new Map(this.#memory.requests.map((request) => [request.id, request]))
    return this.#memory.replays
      .filter((replay) => !teamId || replay.teamId === teamId)
      .slice(0, cappedLimit)
      .map((replay) => publicReplay(replay, requestById.get(replay.requestId)))
  }

  async overviewStats(teamId?: string): Promise<OverviewStats> {
    await this.#ensureConnected()

    const endpoints = await this.listEndpoints(teamId)
    const requests = await this.listRequests({ teamId, limit: 200 })

    const successes = requests.filter((request) => request.responseStatus < 400).length
    const totalLatency = requests.reduce((sum, request) => sum + request.latencyMs, 0)
    const counts = new Map<string, number>()
    const statusCodes: Record<string, number> = {}

    for (const request of requests) {
      counts.set(request.token, (counts.get(request.token) ?? 0) + 1)
      const bucket = `${Math.floor(request.responseStatus / 100)}xx`
      statusCodes[bucket] = (statusCodes[bucket] ?? 0) + 1
    }

    return {
      totalRequests: requests.length,
      activeEndpoints: endpoints.filter((endpoint) => endpoint.isActive).length,
      successRate: requests.length ? successes / requests.length : 1,
      averageLatencyMs: requests.length ? Math.round(totalLatency / requests.length) : 0,
      topEndpoints: endpoints
        .map((endpoint) => ({
          token: endpoint.token,
          name: endpoint.name,
          count: counts.get(endpoint.token) ?? endpoint.requestCount ?? 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      statusCodes,
    }
  }

  async #findUserByEmail(email: string): Promise<StoredUser | null> {
    if (this.#backend === 'mongo') {
      return this.#users().findOne({ email })
    }

    return this.#memory.users.find((user) => user.email === email) ?? null
  }

  async #findInviteById(id: string): Promise<StoredTeamInvite | null> {
    if (this.#backend === 'mongo') {
      return this.#invites().findOne({ id })
    }

    return this.#memory.invites.find((invite) => invite.id === id) ?? null
  }

  async #acceptInvite(id: string) {
    if (this.#backend === 'mongo') {
      await this.#invites().updateOne({ id }, { $set: { status: 'accepted' } })
      return
    }

    const invite = this.#memory.invites.find((item) => item.id === id)
    if (invite) {
      invite.status = 'accepted'
    }
  }

  async #createSession(user: StoredUser): Promise<AuthResult> {
    const token = `rqs_${randomBytes(32).toString('base64url')}`
    const session: StoredSession = {
      _id: randomUUID(),
      id: randomUUID(),
      userId: user.id,
      teamId: user.teamId,
      tokenHash: hashToken(token),
      createdAt: new Date().toISOString(),
    }

    if (this.#backend === 'mongo') {
      await this.#sessions().insertOne(session)
    } else {
      this.#memory.sessions.unshift(session)
    }

    return {
      token,
      user: publicUser(user),
    }
  }

  async #ensureDefaultNotificationPreferences(teamId: string): Promise<NotificationPreferences> {
    if (this.#backend === 'mongo') {
      const existing = await this.#notificationPreferences().findOne({ teamId })
      if (existing) {
        return publicNotificationPreferences(existing)
      }

      const created = defaultNotificationPreferences(teamId)
      await this.#notificationPreferences().insertOne(created)
      return publicNotificationPreferences(created)
    }

    const existing = this.#memory.notificationPreferences.find((item) => item.teamId === teamId)
    if (existing) {
      return publicNotificationPreferences(existing)
    }

    const created = defaultNotificationPreferences(teamId)
    this.#memory.notificationPreferences.push(created)
    return publicNotificationPreferences(created)
  }

  async #ensureConnected() {
    if (this.#connectPromise) {
      await this.#connectPromise
      return
    }

    this.#connectPromise = this.#connect()
    await this.#connectPromise
  }

  async #connect() {
    if (env.get('REQTAP_STORAGE') === 'memory' || env.get('NODE_ENV') === 'test') {
      this.#backend = 'memory'
      return
    }

    const uri = env.get('MONGO_URI') ?? 'mongodb://localhost:27017/reqtap'

    try {
      this.#client = new MongoClient(uri, { serverSelectionTimeoutMS: 900 })
      await this.#client.connect()
      this.#db = this.#client.db()
      await this.#ensureIndexes()
      this.#backend = 'mongo'
    } catch (error) {
      console.warn('[reqtap] MongoDB unavailable; falling back to in-memory storage.', error)
      this.#client = undefined
      this.#db = undefined
      this.#backend = 'memory'
    }
  }

  async #ensureIndexes() {
    await Promise.all([
      this.#endpoints().createIndex({ token: 1 }, { unique: true }),
      this.#endpoints().createIndex({ teamId: 1, createdAt: -1 }),
      this.#requests().createIndex({ token: 1, createdAt: -1 }),
      this.#requests().createIndex({ teamId: 1, createdAt: -1 }),
      this.#requests().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.#replays().createIndex({ requestId: 1, createdAt: -1 }),
      this.#replays().createIndex({ teamId: 1, createdAt: -1 }),
      this.#users().createIndex({ email: 1 }, { unique: true }),
      this.#sessions().createIndex({ tokenHash: 1 }, { unique: true }),
      this.#passwordResets().createIndex({ tokenHash: 1 }, { unique: true }),
      this.#passwordResets().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.#apiKeys().createIndex({ keyHash: 1 }, { unique: true }),
      this.#apiKeys().createIndex({ teamId: 1, createdAt: -1 }),
      this.#invites().createIndex({ teamId: 1, createdAt: -1 }),
      this.#notificationPreferences().createIndex({ teamId: 1 }, { unique: true }),
      this.#notificationEvents().createIndex({ teamId: 1, createdAt: -1 }),
    ])
  }

  #endpoints(): Collection<StoredEndpoint> {
    return this.#db!.collection<StoredEndpoint>('endpoints')
  }

  #requests(): Collection<StoredRequest> {
    return this.#db!.collection<StoredRequest>('requests')
  }

  #replays(): Collection<StoredReplay> {
    return this.#db!.collection<StoredReplay>('replays')
  }

  #users(): Collection<StoredUser> {
    return this.#db!.collection<StoredUser>('users')
  }

  #sessions(): Collection<StoredSession> {
    return this.#db!.collection<StoredSession>('sessions')
  }

  #passwordResets(): Collection<StoredPasswordReset> {
    return this.#db!.collection<StoredPasswordReset>('password_resets')
  }

  #apiKeys(): Collection<StoredApiKey> {
    return this.#db!.collection<StoredApiKey>('api_keys')
  }

  #invites(): Collection<StoredTeamInvite> {
    return this.#db!.collection<StoredTeamInvite>('team_invites')
  }

  #notificationPreferences(): Collection<StoredNotificationPreferences> {
    return this.#db!.collection<StoredNotificationPreferences>('notification_preferences')
  }

  #notificationEvents(): Collection<StoredNotificationEvent> {
    return this.#db!.collection<StoredNotificationEvent>('notification_events')
  }
}

function normalizeProvider(provider?: string): WebhookProvider | undefined {
  return provider === 'stripe' || provider === 'github' || provider === 'shopify' || provider === 'clerk'
    ? provider
    : undefined
}

function normalizeRole(role?: string): TeamRole {
  return role === 'Owner' || role === 'Admin' || role === 'Member' ? role : 'Member'
}

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    const error = new Error('A valid email address is required') as Error & { status: number }
    error.status = 422
    throw error
  }
  return normalized
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) {
    return false
  }

  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function publicUser(user: StoredUser): AuthUser {
  const { _id: _id, passwordHash: _passwordHash, ...safe } = user
  return safe
}

function publicApiKey(apiKey: StoredApiKey): ApiKey {
  const { _id: _id, keyHash: _keyHash, ...safe } = apiKey
  return safe
}

function publicInvite(invite: StoredTeamInvite): TeamInvite {
  const { _id: _id, ...safe } = invite
  return safe
}

function defaultNotificationPreferences(teamId: string): StoredNotificationPreferences {
  return {
    _id: randomUUID(),
    teamId,
    failedWebhookAlerts: true,
    signatureFailures: true,
    endpointQuiet: false,
    weeklySummary: true,
    productUpdates: false,
    updatedAt: new Date().toISOString(),
  }
}

function publicNotificationPreferences(
  preferences: StoredNotificationPreferences
): NotificationPreferences {
  const { _id: _id, ...safe } = preferences
  return safe
}

function publicNotificationEvent(event: StoredNotificationEvent): NotificationEvent {
  const { _id: _id, ...safe } = event
  return safe
}

function normalizeResponseConfig(config?: Partial<ResponseConfig>): ResponseConfig {
  return {
    status: clampStatus(config?.status),
    body: config?.body ?? DEFAULT_RESPONSE.body,
    headers: { ...DEFAULT_RESPONSE.headers, ...config?.headers },
  }
}

function clampStatus(status?: number) {
  if (!status || Number.isNaN(status)) {
    return DEFAULT_RESPONSE.status
  }

  return Math.min(Math.max(Math.trunc(status), 100), 599)
}

function clampRetention(days?: number) {
  if (!days || Number.isNaN(days)) {
    return 30
  }

  return Math.min(Math.max(Math.trunc(days), 1), 365)
}

function sanitizeSlug(slug?: string) {
  const normalized = slug?.trim()

  if (!normalized) {
    return undefined
  }

  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(normalized)) {
    const error = new Error('Slug must be 3-64 chars and contain only letters, numbers, "_" or "-"') as Error & {
      status: number
    }
    error.status = 422
    throw error
  }

  return normalized
}

function randomToken() {
  return randomBytes(9).toString('base64url')
}

function publicEndpoint(endpoint: StoredEndpoint): Endpoint {
  const { signingSecret: _secret, _id: _id, ...safe } = endpoint
  return {
    ...safe,
    signingSecretConfigured: Boolean(endpoint.signingSecret),
  }
}

function publicRequest(request: StoredRequest): WebhookRequest {
  const { _id: _id, teamId: _teamId, expiresAt: _expiresAt, ...safe } = request
  return safe
}

function publicReplay(
  replay: StoredReplay,
  request?: Pick<WebhookRequest, 'method' | 'path' | 'createdAt'>
): Replay {
  const { _id: _id, teamId: _teamId, ...safe } = replay
  return request
    ? {
        ...safe,
        request: {
          method: request.method,
          path: request.path,
          createdAt: request.createdAt,
        },
      }
    : safe
}

function conflict(message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = 409
  return error
}

function isDuplicateKey(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000
}

function requestMongoQuery(filters: RequestFilters) {
  const query: Record<string, any> = {}

  if (filters.teamId) {
    query.teamId = filters.teamId
  }

  if (filters.token) {
    query.token = filters.token
  }

  if (filters.method && filters.method !== 'ALL') {
    query.method = filters.method.toUpperCase()
  }

  if (filters.status === 'failed') {
    query.responseStatus = { $gte: 400 }
  }

  if (filters.since) {
    query.createdAt = { $gt: filters.since }
  }

  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), 'i')
    query.$or = [{ path: regex }, { bodyRaw: regex }, { provider: regex }, { 'headers.user-agent': regex }]
  }

  return query
}

function requestMatches(request: WebhookRequest, filters: RequestFilters) {
  if (filters.teamId && 'teamId' in request && request.teamId !== filters.teamId) {
    return false
  }

  if (filters.token && request.token !== filters.token) {
    return false
  }

  if (filters.method && filters.method !== 'ALL' && request.method !== filters.method.toUpperCase()) {
    return false
  }

  if (filters.status === 'failed' && request.responseStatus < 400) {
    return false
  }

  if (filters.since && request.createdAt <= filters.since) {
    return false
  }

  if (filters.q) {
    const haystack = `${request.path} ${request.provider ?? ''} ${request.bodyRaw} ${request.headers['user-agent'] ?? ''}`
    return haystack.toLowerCase().includes(filters.q.toLowerCase())
  }

  return true
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const store = new ReqtapStore()
