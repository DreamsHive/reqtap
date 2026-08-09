<script setup lang="ts">
useHead({ title: 'Changelog · Reqtap' })

const tagTone: Record<string, string> = {
  Added: 'text-green-700 bg-green-500/12',
  Fixed: 'text-amber-700 bg-amber-500/12',
  Changed: 'text-brand-700 bg-brand-500/12',
}

const releases = [
  {
    version: 'v0.4.0',
    date: 'Jul 8, 2026',
    changes: [
      { tag: 'Added', text: 'Signature verification for Shopify and Clerk' },
      { tag: 'Added', text: 'Bulk replay — resend up to 50 requests at once' },
      { tag: 'Fixed', text: 'CLI reconnect loop on flaky networks' },
    ],
  },
  {
    version: 'v0.3.0',
    date: 'Jun 24, 2026',
    changes: [
      { tag: 'Added', text: 'Custom response bodies per endpoint' },
      { tag: 'Changed', text: 'Faster request list with virtualized rendering' },
      { tag: 'Fixed', text: 'Timezone bug in the analytics chart' },
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Jun 10, 2026',
    changes: [
      { tag: 'Added', text: 'Dark mode across the whole app' },
      { tag: 'Added', text: 'Search & filter in the request list' },
    ],
  },
]
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-canvas">
    <header class="flex w-full items-center justify-between border-b border-[var(--color-line)] bg-white px-8 py-4">
      <AppLogo />
      <nav class="flex items-center gap-6 text-sm font-medium text-gray-500">
        <NuxtLink to="/docs" class="hover:text-ink">Docs</NuxtLink>
        <a href="#" class="hover:text-ink">Changelog</a>
        <a href="#" class="hover:text-ink">GitHub</a>
      </nav>
    </header>

    <div class="flex w-[720px] max-w-full flex-col gap-4 py-12">
      <h1 class="text-4xl font-extrabold text-ink">Changelog</h1>
      <p class="text-base text-gray-500">New features, improvements and fixes.</p>

      <div
        v-for="r in releases"
        :key="r.version"
        class="flex gap-7 border-t border-[var(--color-line)] py-7"
      >
        <div class="flex w-[140px] shrink-0 flex-col gap-2">
          <span class="w-fit rounded-full bg-brand-500/10 px-2.5 py-[5px] text-[13px] font-semibold text-brand-500">{{ r.version }}</span>
          <span class="text-[13px] text-gray-400">{{ r.date }}</span>
        </div>
        <div class="flex flex-1 flex-col gap-3">
          <div v-for="(c, i) in r.changes" :key="i" class="flex items-start gap-2.5">
            <span class="w-16 shrink-0 rounded-md px-2 py-[3px] text-center text-[11px] font-semibold" :class="tagTone[c.tag]">{{ c.tag }}</span>
            <p class="flex-1 text-sm leading-[1.5] text-[#3f3f46]">{{ c.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
