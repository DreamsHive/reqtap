import type { IncomingHttpHeaders, IncomingMessage } from 'node:http'

export class PayloadTooLargeError extends Error {
  status = 413

  constructor(limitBytes: number) {
    super(`Request body exceeds ${limitBytes} bytes`)
  }
}

export async function readRawBody(request: IncomingMessage, limitBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let total = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length

    if (total > limitBytes) {
      throw new PayloadTooLargeError(limitBytes)
    }

    chunks.push(buffer)
  }

  return Buffer.concat(chunks)
}

export async function readJsonBody<T extends Record<string, any>>(
  request: IncomingMessage,
  limitBytes = 64 * 1024
): Promise<T> {
  const raw = await readRawBody(request, limitBytes)

  if (raw.length === 0) {
    return {} as T
  }

  try {
    return JSON.parse(raw.toString('utf8')) as T
  } catch {
    const error = new Error('Expected a valid JSON request body') as Error & { status: number }
    error.status = 400
    throw error
  }
}

export function normalizeHeaders(headers: IncomingHttpHeaders): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      const normalized = Array.isArray(value) ? value.join(', ') : value ?? ''
      return [key.toLowerCase(), normalized]
    })
  )
}

export function normalizeQuery(query: Record<string, any>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.join(',')]
      }

      if (value === null || value === undefined) {
        return [key, '']
      }

      return [key, String(value)]
    })
  )
}
