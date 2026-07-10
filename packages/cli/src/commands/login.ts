import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: { name: 'login', description: 'TODO (CLI-0x): implement login' },
  async run() {
    consola.info('`wh login` is coming in Week 3 — see docs/PRD.md §5.3')
  },
})
