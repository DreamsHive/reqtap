import { defineCommand } from 'citty'
import { consola } from 'consola'
import type { WebhookRequest } from '@reqtap/shared'
import { cursorKey, loadConfig, loadCursor, saveCursor } from '../config.js'
import { apiRequest } from '../http.js'
import { connectEventStream } from '../sse.js'

export default defineCommand({
  meta: { name: 'tail', description: 'Print live webhook requests for an endpoint.' },
  args: {
    token: {
      type: 'positional',
      description: 'Endpoint token',
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
    const cursor = cursorKey(config, 'tail', args.token)
    let lastSeen = await loadCursor(cursor)
    consola.info(`Tailing ${config.apiBase}/t/${args.token}`)
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
            printRequest(request)
            lastSeen = request.createdAt
            await saveCursor(cursor, lastSeen)
          }
        }

        await connectEventStream(config, args.token, async (event) => {
          if (event.type === 'ready') {
            consola.success('Connected')
            return
          }

          if (event.type === 'replay.result') {
            const result = event.data.resultStatus ? event.data.resultStatus : event.data.error
            consola.info(`replay ${event.data.targetUrl} -> ${result}`)
            return
          }

          const request = event.data
          printRequest(request)
          lastSeen = request.createdAt
          await saveCursor(cursor, lastSeen)
        })
      } catch (error) {
        consola.warn(`Stream disconnected: ${error instanceof Error ? error.message : 'unknown error'}`)
        await sleep(1500)
      }
    }
  },
})

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function printRequest(request: WebhookRequest) {
  const signature = request.signatureStatus === 'not_detected' ? '' : ` signature=${request.signatureStatus}`
  const preview = request.bodyRaw.replace(/\s+/g, ' ').slice(0, 120)
  consola.log(
    `${request.createdAt} ${request.method} ${request.path} ${request.responseStatus} ${request.bodySize}b${signature}`
  )

  if (preview) {
    consola.log(`  ${preview}${request.bodyRaw.length > 120 ? '...' : ''}`)
  }
}
