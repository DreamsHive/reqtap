import { defineCommand } from 'citty'
import { consola } from 'consola'
import type { WebhookRequest } from '@reqtap/shared'
import { cursorKey, loadConfig, loadCursor, saveCursor } from '../config.js'
import { apiRequest, forwardWebhook } from '../http.js'
import { connectEventStream } from '../sse.js'

export default defineCommand({
  meta: { name: 'forward', description: 'Forward live webhook requests to a local target.' },
  args: {
    token: {
      type: 'positional',
      description: 'Endpoint token',
      required: true,
    },
    to: {
      type: 'string',
      description: 'Forward target, for example localhost:3000/webhooks',
      required: true,
    },
    apiBase: {
      type: 'string',
      alias: 'b',
      description: 'Reqtap server URL',
    },
  },
  async run({ args }) {
    const config = await loadConfig({ apiBase: args.apiBase || undefined })
    const target = args.to
    const cursor = cursorKey(config, 'forward', args.token, target)
    let lastSeen = await loadCursor(cursor)

    consola.info(`Listening on ${config.apiBase}/t/${args.token}`)
    consola.info(`Forwarding to ${target}`)
    if (lastSeen) {
      consola.info(`Resuming from ${lastSeen}`)
    }

    while (true) {
      try {
        if (lastSeen) {
          const missed = await apiRequest<{ data: WebhookRequest[] }>(
            config,
            `/api/requests?token=${encodeURIComponent(args.token)}&since=${encodeURIComponent(lastSeen)}&limit=200`
          )

          for (const request of missed.data.reverse()) {
            if (!(await forwardAndReport(request, target))) {
              throw new Error('Forward failed; cursor was not advanced')
            }
            lastSeen = request.createdAt
            await saveCursor(cursor, lastSeen)
          }
        }

        await connectEventStream(config, args.token, async (event) => {
          if (event.type !== 'request.new') {
            return
          }

          if (!(await forwardAndReport(event.data, target))) {
            throw new Error('Forward failed; cursor was not advanced')
          }
          lastSeen = event.data.createdAt
          await saveCursor(cursor, lastSeen)
        })
      } catch (error) {
        consola.warn(`Stream disconnected: ${error instanceof Error ? error.message : 'unknown error'}`)
        await sleep(1500)
      }
    }
  },
})

async function forwardAndReport(request: WebhookRequest, target: string) {
  try {
    const result = await forwardWebhook(request, target)
    consola.success(
      `${request.method} ${request.path} -> ${result.status} ${result.latencyMs}ms ${result.targetUrl}`
    )
    return true
  } catch (error) {
    consola.error(`${request.method} ${request.path} -> ${error instanceof Error ? error.message : 'failed'}`)
    return false
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
