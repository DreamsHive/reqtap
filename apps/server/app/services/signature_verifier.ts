import { createHmac, timingSafeEqual } from 'node:crypto'
import type { SignatureStatus, WebhookProvider } from '@reqtap/shared'

export interface SignatureResult {
  provider?: WebhookProvider
  status: SignatureStatus
  valid?: boolean
}

export function verifySignature(
  headers: Record<string, string>,
  rawBody: Buffer,
  configuredProvider?: WebhookProvider,
  signingSecret?: string
): SignatureResult {
  const detectedProvider = detectProvider(headers) ?? configuredProvider

  if (!detectedProvider) {
    return { status: 'not_detected' }
  }

  if (!signingSecret) {
    return { provider: detectedProvider, status: 'missing_secret' }
  }

  const valid = verifyProviderSignature(detectedProvider, headers, rawBody, signingSecret)

  return {
    provider: detectedProvider,
    status: valid ? 'verified' : 'invalid',
    valid,
  }
}

function detectProvider(headers: Record<string, string>): WebhookProvider | undefined {
  if (headers['stripe-signature']) {
    return 'stripe'
  }

  if (headers['x-hub-signature-256']) {
    return 'github'
  }

  if (headers['x-shopify-hmac-sha256']) {
    return 'shopify'
  }

  if (headers['svix-id'] && headers['svix-timestamp'] && headers['svix-signature']) {
    return 'clerk'
  }

  return undefined
}

function verifyProviderSignature(
  provider: WebhookProvider,
  headers: Record<string, string>,
  rawBody: Buffer,
  secret: string
): boolean {
  if (provider === 'stripe') {
    return verifyStripe(headers['stripe-signature'], rawBody, secret)
  }

  if (provider === 'github') {
    return verifyGitHub(headers['x-hub-signature-256'], rawBody, secret)
  }

  if (provider === 'shopify') {
    return verifyShopify(headers['x-shopify-hmac-sha256'], rawBody, secret)
  }

  return verifyClerk(headers, rawBody, secret)
}

function verifyStripe(signatureHeader: string | undefined, rawBody: Buffer, secret: string): boolean {
  if (!signatureHeader) {
    return false
  }

  const parts = new Map<string, string[]>()

  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=', 2)
    if (!key || !value) {
      continue
    }

    const values = parts.get(key) ?? []
    values.push(value)
    parts.set(key, values)
  }

  const timestamp = parts.get('t')?.[0]
  const signatures = parts.get('v1') ?? []

  if (!timestamp || signatures.length === 0) {
    return false
  }

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex')

  return signatures.some((signature) => safeEqualHex(signature, expected))
}

function verifyGitHub(signatureHeader: string | undefined, rawBody: Buffer, secret: string): boolean {
  if (!signatureHeader?.startsWith('sha256=')) {
    return false
  }

  const actual = signatureHeader.slice('sha256='.length)
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  return safeEqualHex(actual, expected)
}

function verifyShopify(signatureHeader: string | undefined, rawBody: Buffer, secret: string): boolean {
  if (!signatureHeader) {
    return false
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('base64')
  return safeEqualString(signatureHeader, expected)
}

function verifyClerk(headers: Record<string, string>, rawBody: Buffer, secret: string): boolean {
  const id = headers['svix-id']
  const timestamp = headers['svix-timestamp']
  const signatureHeader = headers['svix-signature']

  if (!id || !timestamp || !signatureHeader) {
    return false
  }

  const secretValue = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  const secretBytes = Buffer.from(secretValue, 'base64')
  const signedContent = `${id}.${timestamp}.${rawBody.toString('utf8')}`
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64')

  return signatureHeader
    .split(' ')
    .some((part) => {
      const [version, signature] = part.split(',', 2)
      return version === 'v1' && Boolean(signature) && safeEqualString(signature, expected)
    })
}

function safeEqualHex(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')

  if (actualBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(actualBuffer, expectedBuffer)
}

function safeEqualString(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  if (actualBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(actualBuffer, expectedBuffer)
}
