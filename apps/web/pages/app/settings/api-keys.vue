<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'API keys · Reqtap' })

const keys = [
  { name: 'Production', key: 'rqx_live_••••••••7f2a', created: 'Apr 2, 2026', used: '2 min ago' },
  { name: 'CI pipeline', key: 'rqx_live_••••••••9c1b', created: 'Mar 18, 2026', used: '1 day ago' },
  { name: 'Local dev', key: 'rqx_test_••••••••3d0e', created: 'Mar 2, 2026', used: '3 weeks ago' },
]

const showCreate = ref(false)
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="API keys" subtitle="Create keys to manage endpoints and pull analytics via the API.">
      <template #actions>
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="showCreate = true">Create key</UButton>
      </template>
    </PageHeader>

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="flex items-center gap-4 border-b border-[var(--color-line)] bg-subtle px-5 py-3 text-[12px] font-semibold text-gray-500">
        <span class="w-[200px]">Name</span>
        <span class="flex-1">Key</span>
        <span class="w-[130px]">Created</span>
        <span class="w-[130px]">Last used</span>
        <span class="w-[80px]" />
      </div>
      <div
        v-for="k in keys"
        :key="k.name"
        class="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-[15px] last:border-b-0 hover:bg-gray-50"
      >
        <span class="w-[200px] text-sm font-semibold text-ink">{{ k.name }}</span>
        <span class="rt-mono flex-1 text-[13px] text-gray-500">{{ k.key }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ k.created }}</span>
        <span class="w-[130px] text-[13px] text-gray-500">{{ k.used }}</span>
        <button class="w-[80px] text-left text-[13px] font-semibold text-red-600 hover:underline">Revoke</button>
      </div>
    </div>

    <CreateApiKeyModal v-model:open="showCreate" />
  </div>
</template>
