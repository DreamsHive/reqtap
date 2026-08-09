<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Overview · Reqtap' })

const stats = [
  { label: 'Total requests', value: '1.24M', delta: '12%', deltaUp: true, bars: [15, 20, 17.5, 27.5, 24, 31, 29] },
  { label: 'Success rate', value: '99.2%', delta: '0.3%', deltaUp: true, bars: [25, 26, 25.5, 27, 26.5, 27.5, 28] },
  { label: 'Avg latency', value: '48ms', delta: '5ms', deltaUp: false, bars: [30, 27.5, 29, 25, 26, 24, 23] },
  { label: 'Active endpoints', value: '28', delta: '3', deltaUp: true, bars: [10, 11, 12, 12, 13, 13.5, 14] },
]

// success (indigo) heights + failed (red) caps for the bar chart
const chart = Array.from({ length: 30 }, (_, i) => {
  const base = 70 + Math.min(i * 5, 135) + (i % 3) * 8
  return { success: base, failed: 5 + (i % 5) * 2 }
})

const topEndpoints = [
  { name: 'stripe-prod', count: '842k', pct: 100, color: 'bg-brand-500' },
  { name: 'github-ci', count: '291k', pct: 35, color: 'bg-method-get' },
  { name: 'shopify-orders', count: '68k', pct: 8, color: 'bg-green-500' },
  { name: 'clerk-users', count: '41k', pct: 5, color: 'bg-method-put' },
  { name: 'sendgrid-events', count: '22k', pct: 3, color: 'bg-violet-500' },
]

const statusCodes = [
  { label: '2xx Success', pct: '94%', width: 94, dot: 'bg-green-500' },
  { label: '4xx Client', pct: '4.5%', width: 4.5, dot: 'bg-method-put' },
  { label: '5xx Server', pct: '1.2%', width: 1.2, dot: 'bg-red-500' },
  { label: '3xx Redirect', pct: '0.3%', width: 0.3, dot: 'bg-method-get' },
]
</script>

<template>
  <div class="flex flex-col gap-5 px-8 py-7">
    <PageHeader title="Overview" subtitle="Traffic across all your endpoints.">
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
          class="rounded-[9px] bg-white text-[13px] font-medium text-ink"
        >
          Last 30 days
        </UButton>
      </template>
    </PageHeader>

    <!-- KPI cards -->
    <div class="flex gap-4">
      <StatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <!-- Requests over time -->
    <div class="rounded-[14px] border border-[var(--color-line)] bg-white px-[22px] pb-[22px] pt-5">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-ink">Requests over time</h2>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
            <span class="size-2 rounded-full bg-brand-500" /> Success
          </span>
          <span class="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
            <span class="size-2 rounded-full bg-red-500" /> Failed
          </span>
        </div>
      </div>
      <div class="mt-4 flex h-[220px] items-end justify-between gap-1">
        <div
          v-for="(bar, i) in chart"
          :key="i"
          class="flex flex-1 flex-col items-center justify-end"
        >
          <span
            class="w-4 rounded-t bg-red-500/80"
            :style="{ height: `${bar.failed}px` }"
          />
          <span
            class="w-4 bg-gradient-to-b from-brand-500 to-brand-500/35"
            :style="{ height: `${bar.success}px` }"
          />
        </div>
      </div>
    </div>

    <!-- Lower panels -->
    <div class="flex gap-4">
      <div class="flex flex-1 flex-col gap-4 rounded-[14px] border border-[var(--color-line)] bg-white px-[22px] pb-[22px] pt-5">
        <h2 class="text-base font-semibold text-ink">Top endpoints</h2>
        <div v-for="e in topEndpoints" :key="e.name" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-ink">{{ e.name }}</span>
            <span class="text-[13px] font-semibold text-gray-500">{{ e.count }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full border border-[var(--color-line)] bg-subtle">
            <div class="h-2 rounded-full" :class="e.color" :style="{ width: `${e.pct}%` }" />
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4 rounded-[14px] border border-[var(--color-line)] bg-white px-[22px] pb-[22px] pt-5">
        <h2 class="text-base font-semibold text-ink">Status codes</h2>
        <div v-for="s in statusCodes" :key="s.label" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm font-medium text-ink">
              <span class="size-2 rounded-full" :class="s.dot" /> {{ s.label }}
            </span>
            <span class="text-[13px] font-semibold text-gray-500">{{ s.pct }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full border border-[var(--color-line)] bg-subtle">
            <div class="h-2 rounded-full" :class="s.dot" :style="{ width: `${Math.max(s.width, 1)}%` }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
