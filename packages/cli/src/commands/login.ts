import { defineCommand } from 'citty'
import { consola } from 'consola'
import { loadConfig, saveConfig } from '../config.js'

export default defineCommand({
  meta: { name: 'login', description: 'Save the Reqtap API base URL and optional API key.' },
  args: {
    apiBase: {
      type: 'string',
      alias: 'b',
      description: 'Reqtap server URL',
      default: process.env.REQTAP_API_BASE ?? 'http://localhost:3333',
    },
    key: {
      type: 'string',
      alias: 'k',
      description: 'API key. Optional for the local v0.1 server.',
    },
    email: {
      type: 'string',
      alias: 'e',
      description: 'Account email for backend login',
    },
    password: {
      type: 'string',
      alias: 'p',
      description: 'Account password for backend login',
    },
  },
  async run({ args }) {
    const config = await loadConfig({
      apiBase: args.apiBase,
      apiKey: args.key || undefined,
    })

    if (args.email && args.password) {
      const response = await fetch(`${config.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: args.email, password: args.password }),
      })
      const body = (await response.json()) as { token?: string; error?: string }

      if (!response.ok || !body.token) {
        throw new Error(body.error ?? 'Login failed')
      }

      config.apiKey = body.token
    }

    await saveConfig(config)
    consola.success(`Saved Reqtap API base: ${config.apiBase}`)
    if (config.apiKey) {
      consola.info('Stored an auth token for API requests')
    }
  },
})
