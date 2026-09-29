import type { Replay, WebhookRequest } from '@reqtap/shared'
import type { CliConfig } from './config.js'

export type StreamEvent =
  | { type: 'request.new'; data: WebhookRequest }
  | { type: 'replay.result'; data: Replay }
  | { type: 'ready'; data: { token: string } }

export async function connectEventStream(
  config: CliConfig,
  token: string,
  onEvent: (event: StreamEvent) => Promise<void> | void,
  signal?: AbortSignal
) {
  const headers = new Headers()

  if (config.apiKey) {
    headers.set('authorization', `Bearer ${config.apiKey}`)
  }

  const response = await fetch(`${config.apiBase}/api/events/${token}`, { headers, signal })

  if (!response.ok || !response.body) {
    throw new Error(`Stream failed: ${response.status} ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      const event = parseSseFrame(frame)

      if (event) {
        await onEvent(event)
      }
    }
  }
}

function parseSseFrame(frame: string): StreamEvent | null {
  let type = 'message'
  const data: string[] = []

  for (const line of frame.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }

    if (line.startsWith('event:')) {
      type = line.slice('event:'.length).trim()
      continue
    }

    if (line.startsWith('data:')) {
      data.push(line.slice('data:'.length).trimStart())
    }
  }

  if (!data.length) {
    return null
  }

  return {
    type,
    data: JSON.parse(data.join('\n')),
  } as StreamEvent
}
