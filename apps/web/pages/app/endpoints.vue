<script setup lang="ts">
import type { Endpoint } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Endpoints · Reqtap' })

const showCreate = ref(false)
const endpoints = ref<Endpoint[]>([])
const pending = ref(true)
const error = ref<unknown>(null)

onMounted(refreshEndpoints)

async function copyUrl(token: string) {
  await navigator.clipboard.writeText(endpointUrl(token))
}

async function refreshEndpoints() {
  pending.value = true
  error.value = null

  try {
    const result = await authFetch<ApiList<Endpoint>>('/api/endpoints')
    endpoints.value = result.data
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Endpoints" subtitle="Unique URLs that capture incoming webhooks.">
      <template #actions>
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="() => { showCreate = true }">New endpoint</UButton>
      </template>
    </PageHeader>

    <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
      <SkeletonList :rows="5" />
    </div>

    <div v-else-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      Could not load endpoints. Check that the server is running.
    </div>

    <div v-else-if="!endpoints.length" class="rounded-[14px] border border-[var(--color-line)] bg-white py-14">
      <EmptyState icon="i-lucide-webhook" title="No endpoints yet" description="Create an endpoint to get your first capture URL.">
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="() => { showCreate = true }">New endpoint</UButton>
      </EmptyState>
    </div>

    <div v-else class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="w-[220px]">Endpoint</span>
        <span class="flex-1">URL</span>
        <span class="w-[110px]">Requests</span>
        <span class="w-[130px]">Last activity</span>
        <span class="w-[110px]">Status</span>
      </div>
      <div
        v-for="e in endpoints"
        :key="e.token"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="w-[220px] text-sm font-semibold text-ink">{{ e.name }}</span>
        <button class="rt-mono flex-1 truncate text-left text-[13px] text-brand-500" @click="copyUrl(e.token)">
          {{ endpointUrl(e.token) }}
        </button>
        <span class="w-[110px] text-[13px] font-medium text-ink">{{ (e.requestCount ?? 0).toLocaleString() }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ formatRelativeTime(e.lastRequestAt) }}</span>
        <span class="w-[110px]">
          <StatusPill :tone="e.isActive ? 'success' : 'neutral'">{{ e.isActive ? 'Active' : 'Paused' }}</StatusPill>
        </span>
      </div>
    </div>

    <NewEndpointModal v-model:open="showCreate" @created="refreshEndpoints" />
  </div>
</template>
