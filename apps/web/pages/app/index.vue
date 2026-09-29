<script setup lang="ts">
import type { OverviewStats } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Overview · Reqtap' })

const data = ref<OverviewStats | null>(null)
const overview = computed(
  () =>
    data.value ?? {
      totalRequests: 0,
      activeEndpoints: 0,
      successRate: 1,
      averageLatencyMs: 0,
      topEndpoints: [],
      statusCodes: {},
    }
)

onMounted(async () => {
  data.value = await authFetch<OverviewStats>('/api/stats')
})

const stats = computed(() => [
  { label: 'Total requests', value: overview.value.totalRequests.toLocaleString(), delta: 'live', deltaUp: true, bars: [8, 12, 10, 16, 14, 18, 20] },
  { label: 'Success rate', value: `${(overview.value.successRate * 100).toFixed(1)}%`, delta: '2xx', deltaUp: true, bars: [18, 18, 19, 20, 20, 21, 22] },
  { label: 'Avg latency', value: `${overview.value.averageLatencyMs}ms`, delta: 'p50', deltaUp: false, bars: [18, 16, 15, 14, 13, 12, 10] },
  { label: 'Active endpoints', value: overview.value.activeEndpoints.toLocaleString(), delta: 'now', deltaUp: true, bars: [8, 9, 10, 11, 11, 12, 13] },
])

// success (indigo) heights + failed (red) caps for the bar chart
const chart = Array.from({ length: 30 }, (_, i) => {
  const base = 70 + Math.min(i * 5, 135) + (i % 3) * 8
  return { success: base, failed: 5 + (i % 5) * 2 }
})

const topEndpoints = computed(() => {
  const max = Math.max(...overview.value.topEndpoints.map((endpoint) => endpoint.count), 1)
  const colors = ['bg-brand-500', 'bg-method-get', 'bg-green-500', 'bg-method-put', 'bg-violet-500']
  return overview.value.topEndpoints.map((endpoint, index) => ({
    name: endpoint.name,
    count: endpoint.count.toLocaleString(),
    pct: Math.max((endpoint.count / max) * 100, 2),
    color: colors[index] ?? 'bg-brand-500',
  }))
})

const statusCodes = computed(() => {
  const total = Object.values(overview.value.statusCodes).reduce((sum, count) => sum + count, 0) || 1
  const labels: Record<string, { label: string; dot: string }> = {
    '2xx': { label: '2xx Success', dot: 'bg-green-500' },
    '3xx': { label: '3xx Redirect', dot: 'bg-method-get' },
    '4xx': { label: '4xx Client', dot: 'bg-method-put' },
    '5xx': { label: '5xx Server', dot: 'bg-red-500' },
  }

  return Object.entries(labels).map(([key, meta]) => {
    const count = overview.value.statusCodes[key] ?? 0
    const width = (count / total) * 100
    return { label: meta.label, pct: `${width.toFixed(1)}%`, width, dot: meta.dot }
  })
})
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
        <EmptyState v-if="!topEndpoints.length" icon="i-lucide-webhook" title="No traffic yet" description="Captured requests will appear here." />
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
