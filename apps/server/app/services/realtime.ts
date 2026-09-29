import type { ServerResponse } from 'node:http'
import type { WSEvent } from '@reqtap/shared'

type Client = {
  response: ServerResponse
  heartbeat: NodeJS.Timeout
}

class RealtimeBroker {
  #clients = new Map<string, Set<Client>>()

  subscribe(token: string, response: ServerResponse, onClose: () => void) {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    response.write(`event: ready\ndata: ${JSON.stringify({ token })}\n\n`)

    const client: Client = {
      response,
      heartbeat: setInterval(() => {
        if (!response.destroyed) {
          response.write(': keepalive\n\n')
        }
      }, 25_000),
    }

    const clients = this.#clients.get(token) ?? new Set<Client>()
    clients.add(client)
    this.#clients.set(token, clients)

    const cleanup = () => {
      clearInterval(client.heartbeat)
      clients.delete(client)

      if (clients.size === 0) {
        this.#clients.delete(token)
      }

      onClose()
    }

    response.on('close', cleanup)
    response.on('error', cleanup)
  }

  publish(token: string, event: WSEvent) {
    const clients = this.#clients.get(token)

    if (!clients) {
      return
    }

    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`

    for (const client of clients) {
      if (client.response.destroyed) {
        clients.delete(client)
        continue
      }

      client.response.write(payload)
    }
  }

  subscriberCount(token?: string) {
    if (token) {
      return this.#clients.get(token)?.size ?? 0
    }

    return [...this.#clients.values()].reduce((sum, clients) => sum + clients.size, 0)
  }
}

export const realtime = new RealtimeBroker()
