import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: { name: 'tail', description: 'TODO (CLI-0x): implement tail' },
  async run() {
    consola.info('`wh tail` is coming in Week 3 — see docs/PRD.md §5.3')
  },
})
