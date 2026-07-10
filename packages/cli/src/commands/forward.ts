import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: { name: 'forward', description: 'TODO (CLI-0x): implement forward' },
  async run() {
    consola.info('`wh forward` is coming in Week 3 — see docs/PRD.md §5.3')
  },
})
