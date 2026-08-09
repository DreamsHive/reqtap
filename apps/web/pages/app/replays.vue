<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Replays · Reqtap' })

const replays = [
  { method: 'POST', path: '/webhooks/stripe', target: 'localhost:3000/webhooks', result: '200 · 38ms', ok: true, when: '2m ago' },
  { method: 'POST', path: '/webhooks/stripe', target: 'localhost:3000/webhooks', result: '200 · 41ms', ok: true, when: '2m ago' },
  { method: 'POST', path: '/webhooks/github', target: 'localhost:4000/hooks', result: '500 · 12ms', ok: false, when: '18m ago' },
  { method: 'POST', path: '/webhooks/shopify', target: 'staging.myapp.io/wh', result: '200 · 120ms', ok: true, when: '1h ago' },
  { method: 'POST', path: '/webhooks/stripe', target: 'localhost:3000/webhooks', result: 'timeout', ok: false, when: '3h ago' },
]
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Replays" subtitle="History of requests you've resent to a target." />

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="flex-1">Original request</span>
        <span class="w-[280px]">Target</span>
        <span class="w-[120px]">Result</span>
        <span class="w-[130px]">When</span>
      </div>
      <div
        v-for="(r, i) in replays"
        :key="i"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="flex flex-1 items-center gap-2">
          <MethodBadge :method="r.method" class="!px-1.5 !py-0.5 !text-[11px]" />
          <span class="rt-mono text-[13px] font-medium text-ink">{{ r.path }}</span>
        </span>
        <span class="rt-mono w-[280px] text-[13px] text-brand-500">{{ r.target }}</span>
        <span class="w-[120px]">
          <StatusPill :tone="r.ok ? 'success' : 'danger'">{{ r.result }}</StatusPill>
        </span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ r.when }}</span>
      </div>
    </div>
  </div>
</template>
