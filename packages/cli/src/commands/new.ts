import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: { name: 'new', description: 'TODO (CLI-0x): implement new' },
  async run() {
    consola.info('`wh new` is coming in Week 3 — see docs/PRD.md §5.3')
  },
})
