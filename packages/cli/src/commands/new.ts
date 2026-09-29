import { defineCommand } from 'citty'
import { consola } from 'consola'
import type { Endpoint } from '@reqtap/shared'
import { loadConfig } from '../config.js'
import { apiRequest } from '../http.js'

export default defineCommand({
  meta: { name: 'new', description: 'Create a new webhook endpoint.' },
  args: {
    name: {
      type: 'string',
      alias: 'n',
      description: 'Endpoint name',
    },
    slug: {
      type: 'string',
      alias: 's',
      description: 'Custom token/slug for /t/:token',
    },
    provider: {
      type: 'string',
      alias: 'p',
      description: 'Signature provider: stripe or github',
    },
    secret: {
      type: 'string',
      description: 'Signing secret for the provider',
    },
    apiBase: {
      type: 'string',
      alias: 'b',
      description: 'Reqtap server URL',
    },
  },
  async run({ args }) {
    const config = await loadConfig({ apiBase: args.apiBase || undefined })
    const result = await apiRequest<{ data: Endpoint; url: string }>(config, '/api/endpoints', {
      method: 'POST',
      json: {
        name: args.name,
        slug: args.slug,
        provider: args.provider,
        signingSecret: args.secret,
      },
    })

    consola.success(`Created endpoint "${result.data.name}"`)
    consola.info(`URL: ${result.url}`)
    consola.info(`Forward: npx @reqtap/cli forward ${result.data.token} --to localhost:3000`)
  },
})
