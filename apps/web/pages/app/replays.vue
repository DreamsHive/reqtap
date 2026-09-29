<script setup lang="ts">
import type { Replay } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Replays · Reqtap' })

const replays = ref<Replay[]>([])
const pending = ref(true)
const error = ref<unknown>(null)

onMounted(loadReplays)

async function loadReplays() {
  pending.value = true
  error.value = null

  try {
    const result = await authFetch<ApiList<Replay>>('/api/replays')
    replays.value = result.data
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Replays" subtitle="History of requests you've resent to a target." />

    <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
      <SkeletonList :rows="5" />
    </div>

    <div v-else-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      Could not load replays.
    </div>

    <div v-else-if="!replays.length" class="rounded-[14px] border border-[var(--color-line)] bg-white py-14">
      <EmptyState icon="i-lucide-repeat" title="No replays yet" description="Replay a captured request from the inspector." />
    </div>

    <div v-else class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="flex-1">Original request</span>
        <span class="w-[280px]">Target</span>
        <span class="w-[120px]">Result</span>
        <span class="w-[130px]">When</span>
      </div>
      <div
        v-for="r in replays"
        :key="r.id"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="flex flex-1 items-center gap-2">
          <MethodBadge :method="r.request?.method ?? 'POST'" class="!px-1.5 !py-0.5 !text-[11px]" />
          <span class="rt-mono text-[13px] font-medium text-ink">{{ r.request?.path ?? r.requestId }}</span>
        </span>
        <span class="rt-mono w-[280px] truncate text-[13px] text-brand-500">{{ r.targetUrl }}</span>
        <span class="w-[120px]">
          <StatusPill :tone="r.error || (r.resultStatus ?? 500) >= 400 ? 'danger' : 'success'">
            {{ r.error ? 'failed' : `${r.resultStatus} · ${r.latencyMs}ms` }}
          </StatusPill>
        </span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ formatRelativeTime(r.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>
