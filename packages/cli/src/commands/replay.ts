import { defineCommand } from 'citty'
import { consola } from 'consola'
import type { Replay } from '@reqtap/shared'
import { loadConfig } from '../config.js'
import { apiRequest } from '../http.js'

export default defineCommand({
  meta: { name: 'replay', description: 'Replay a stored webhook request to a target URL.' },
  args: {
    requestId: {
      type: 'positional',
      description: 'Captured request id',
      required: true,
    },
    to: {
      type: 'string',
      description: 'Replay target, for example localhost:3000/webhooks',
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
    const result = await apiRequest<{ data: Replay }>(config, `/api/requests/${args.requestId}/replay`, {
      method: 'POST',
      json: { targetUrl: args.to },
    })

    if (result.data.error) {
      consola.error(`Replay failed: ${result.data.error}`)
      process.exitCode = 1
      return
    }

    consola.success(
      `Replay sent to ${result.data.targetUrl} -> ${result.data.resultStatus} ${result.data.latencyMs}ms`
    )
  },
})
