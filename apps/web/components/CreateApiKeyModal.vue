<script setup lang="ts">
import type { ApiKey } from '@reqtap/shared'

const props = defineProps<{ open?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; created: [ApiKey] }>()
const name = ref('Production')
const pending = ref(false)
const error = ref('')
const secretKey = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) {
      name.value = 'Production'
      error.value = ''
      secretKey.value = ''
    }
  }
)

async function createKey() {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<{ data: ApiKey; key: string }>('/api/api-keys', {
      method: 'POST',
      body: { name: name.value },
    })
    secretKey.value = result.key
    emit('created', result.data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not create API key'
  } finally {
    pending.value = false
  }
}

async function copyKey() {
  if (secretKey.value) {
    await navigator.clipboard.writeText(secretKey.value)
  }
}
</script>

<template>
  <ModalShell :open="open" :width="460" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">{{ secretKey ? 'API key created' : 'Create API key' }}</h2>
        <button class="text-gray-400 hover:text-ink" @click="close"><UIcon name="i-lucide-x" class="size-5" /></button>
      </div>
      <div class="flex flex-col gap-[18px] px-6 py-[22px]">
        <FormField v-if="!secretKey" v-model="name" label="Name" placeholder="Production" />
        <div v-if="secretKey" class="flex items-start gap-2.5 rounded-[10px] border border-amber-500/40 bg-amber-500/10 px-3.5 py-3">
          <UIcon name="i-lucide-triangle-alert" class="size-[18px] shrink-0 text-amber-600" />
          <p class="flex-1 text-[13px] font-medium leading-[1.45] text-amber-700">Copy this key now — you won't be able to see it again.</p>
        </div>
        <div v-if="secretKey" class="flex flex-col gap-[7px]">
          <label class="text-[13px] font-medium text-ink">Secret key</label>
          <div class="flex items-center gap-2.5 rounded-[9px] bg-[#0c0c12] py-2 pl-3.5 pr-2">
            <span class="rt-mono flex-1 break-all text-[13px] text-[#e7e7ec]">{{ secretKey }}</span>
            <UButton class="rounded-md text-[13px] font-semibold" @click="copyKey">Copy</UButton>
          </div>
        </div>
        <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
      </div>
      <div class="flex justify-end border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton v-if="secretKey" class="rounded-lg text-sm font-semibold" @click="close">Done</UButton>
        <UButton v-else class="rounded-lg text-sm font-semibold" :loading="pending" @click="createKey">Create key</UButton>
      </div>
    </template>
  </ModalShell>
</template>
