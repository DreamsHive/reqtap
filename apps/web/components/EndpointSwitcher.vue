<script setup lang="ts">
import type { Endpoint } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

const open = ref(false)
const current = ref('')
const endpoints = ref<Endpoint[]>([])

const showCreate = ref(false)

onMounted(refreshEndpoints)

watchEffect(() => {
  if (!current.value && endpoints.value[0]) {
    current.value = endpoints.value[0].name
  }
})

function select(endpoint: Endpoint) {
  current.value = endpoint.name
  open.value = false
}

function openCreate() {
  open.value = false
  showCreate.value = true
}

async function refreshEndpoints() {
  const result = await authFetch<ApiList<Endpoint>>('/api/endpoints')
  endpoints.value = result.data
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-2 rounded-lg border-[1.5px] bg-white py-2 pl-3 pr-2.5 text-[13px] font-medium text-ink"
      :class="open ? 'border-brand-500' : 'border-[var(--color-line)]'"
      @click="() => { open = !open }"
    >
      <span class="size-[7px] rounded-full bg-green-500" />
      {{ current || 'No endpoint' }}
      <UIcon name="i-lucide-chevron-down" class="size-3.5 text-gray-400" />
    </button>

    <!-- click-away backdrop -->
    <div v-if="open" class="fixed inset-0 z-30" @click="() => { open = false }" />

    <div
      v-if="open"
      class="absolute left-0 top-[calc(100%+8px)] z-40 w-[300px] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[0px_12px_32px_-4px_rgba(0,0,0,0.12)]"
    >
      <div class="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2.5">
        <UIcon name="i-lucide-search" class="size-3.5 text-gray-400" />
        <input placeholder="Find endpoint…" class="w-full bg-transparent text-[13px] text-ink placeholder:text-gray-400 focus:outline-none">
      </div>
      <button
        v-for="e in endpoints"
        :key="e.token"
        class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
        :class="current === e.name ? 'bg-brand-500/[0.06]' : 'hover:bg-gray-50'"
        @click="select(e)"
      >
        <span class="size-[7px] rounded-full bg-green-500" />
        <span class="flex flex-1 flex-col">
          <span class="text-[13px] font-medium text-ink">{{ e.name }}</span>
          <span class="rt-mono text-[11px] text-gray-500">/t/{{ e.token }}</span>
        </span>
        <UIcon v-if="current === e.name" name="i-lucide-check" class="size-4 text-brand-500" />
      </button>
      <button class="flex w-full items-center gap-2.5 border-t border-[var(--color-line)] bg-subtle px-3 py-3 text-left" @click="openCreate">
        <UIcon name="i-lucide-plus" class="size-4 text-brand-500" />
        <span class="text-[13px] font-semibold text-brand-500">Create endpoint</span>
      </button>
    </div>

    <NewEndpointModal v-model:open="showCreate" @created="refreshEndpoints" />
  </div>
</template>
