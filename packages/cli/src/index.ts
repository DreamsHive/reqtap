#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'wh',
    description: 'Reqtap — tap into your webhooks. Forward, tail and replay from your terminal.',
  },
  subCommands: {
    login: () => import('./commands/login.js').then((m) => m.default),
    new: () => import('./commands/new.js').then((m) => m.default),
    forward: () => import('./commands/forward.js').then((m) => m.default),
    tail: () => import('./commands/tail.js').then((m) => m.default),
    replay: () => import('./commands/replay.js').then((m) => m.default),
  },
})

runMain(main)
