import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: { name: 'replay', description: 'TODO (CLI-0x): implement replay' },
  async run() {
    consola.info('`wh replay` is coming in Week 3 — see docs/PRD.md §5.3')
  },
})
