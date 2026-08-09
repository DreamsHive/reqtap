<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Endpoints · Reqtap' })

const endpoints = [
  { name: 'stripe-prod', url: 'reqtap.dev/t/abc123', requests: '12,408', last: '2s ago', active: true },
  { name: 'github-ci', url: 'reqtap.dev/t/gh9f2k', requests: '3,921', last: '1m ago', active: true },
  { name: 'shopify-orders', url: 'reqtap.dev/t/shp77x', requests: '842', last: '14m ago', active: true },
  { name: 'clerk-users', url: 'reqtap.dev/t/clk3d1', requests: '156', last: '2h ago', active: true },
  { name: 'legacy-test', url: 'reqtap.dev/t/old000', requests: '0', last: '—', active: false },
]

const showCreate = ref(false)
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Endpoints" subtitle="Unique URLs that capture incoming webhooks.">
      <template #actions>
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="showCreate = true">New endpoint</UButton>
      </template>
    </PageHeader>

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="w-[220px]">Endpoint</span>
        <span class="flex-1">URL</span>
        <span class="w-[110px]">Requests</span>
        <span class="w-[130px]">Last activity</span>
        <span class="w-[110px]">Status</span>
      </div>
      <div
        v-for="e in endpoints"
        :key="e.name"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="w-[220px] text-sm font-semibold text-ink">{{ e.name }}</span>
        <span class="rt-mono flex-1 text-[13px] text-brand-500">{{ e.url }}</span>
        <span class="w-[110px] text-[13px] font-medium text-ink">{{ e.requests }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ e.last }}</span>
        <span class="w-[110px]">
          <StatusPill :tone="e.active ? 'success' : 'neutral'">{{ e.active ? 'Active' : 'Paused' }}</StatusPill>
        </span>
      </div>
    </div>

    <NewEndpointModal v-model:open="showCreate" />
  </div>
</template>
