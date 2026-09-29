<script setup lang="ts">
import type { ApiKey } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'API keys · Reqtap' })

const keys = ref<ApiKey[]>([])
const pending = ref(true)
const error = ref('')
const showCreate = ref(false)

onMounted(loadKeys)

async function loadKeys() {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<ApiList<ApiKey>>('/api/api-keys')
    keys.value = result.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load API keys'
  } finally {
    pending.value = false
  }
}

async function revoke(id: string) {
  await authFetch(`/api/api-keys/${id}`, { method: 'DELETE' })
  await loadKeys()
}
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="API keys" subtitle="Create keys to manage endpoints and pull analytics via the API.">
      <template #actions>
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="() => { showCreate = true }">Create key</UButton>
      </template>
    </PageHeader>

    <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
      <SkeletonList :rows="4" />
    </div>

    <div v-else-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {{ error }}
    </div>

    <div v-else-if="!keys.length" class="rounded-[14px] border border-[var(--color-line)] bg-white py-14">
      <EmptyState icon="i-lucide-key-round" title="No API keys" description="Create a key for scripts, CI, or external integrations." />
    </div>

    <div v-else class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="w-[200px]">Name</span>
        <span class="flex-1">Key</span>
        <span class="w-[130px]">Created</span>
        <span class="w-[130px]">Last used</span>
        <span class="w-[90px]" />
      </div>
      <div
        v-for="k in keys"
        :key="k.id"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="w-[200px] text-sm font-semibold text-ink">{{ k.name }}</span>
        <span class="rt-mono flex-1 text-[13px] text-gray-500">{{ k.prefix }}_••••{{ k.last4 }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ formatRelativeTime(k.createdAt) }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ formatRelativeTime(k.lastUsedAt) }}</span>
        <button class="w-[90px] text-left text-[13px] font-semibold text-red-600 hover:underline" @click="revoke(k.id)">Revoke</button>
      </div>
    </div>

    <CreateApiKeyModal v-model:open="showCreate" @created="loadKeys" />
  </div>
</template>
