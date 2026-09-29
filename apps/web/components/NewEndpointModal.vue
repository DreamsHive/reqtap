<script setup lang="ts">
import type { Endpoint } from '@reqtap/shared'

defineProps<{ open?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; created: [Endpoint] }>()
const name = ref('')
const slug = ref('')
const provider = ref('No verification')
const signingSecret = ref('')
const pending = ref(false)
const error = ref('')
const providerOptions = ['No verification', 'Stripe', 'GitHub', 'Shopify', 'Clerk']

async function create(close: () => void) {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<{ data: Endpoint; url: string }>('/api/endpoints', {
      method: 'POST',
      body: {
        name: name.value,
        slug: slug.value,
        provider: provider.value === 'No verification' ? undefined : provider.value.toLowerCase(),
        signingSecret: signingSecret.value || undefined,
      },
    })

    emit('created', result.data)
    name.value = ''
    slug.value = ''
    provider.value = 'No verification'
    signingSecret.value = ''
    close()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not create endpoint'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <ModalShell :open="open" :width="480" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">Create endpoint</h2>
        <button class="text-gray-400 hover:text-ink" @click="close">
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>
      <div class="flex flex-col gap-[18px] px-6 pb-6 pt-[22px]">
        <FormField v-model="name" label="Name" placeholder="e.g. stripe-prod" />
        <div class="flex flex-col gap-[7px]">
          <label class="text-[13px] font-medium text-ink">Custom slug (optional)</label>
          <div class="flex items-center rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-gray-400">
            <span class="rt-mono">reqtap.dev/t/</span>
            <input v-model="slug" placeholder="my-webhook" class="flex-1 bg-transparent text-ink placeholder:text-gray-400 focus:outline-none">
          </div>
        </div>
        <div class="flex flex-col gap-[7px]">
          <label class="text-[13px] font-medium text-ink">Verify signatures from</label>
          <select
            v-model="provider"
            class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option v-for="option in providerOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <FormField v-model="signingSecret" label="Signing secret" placeholder="Optional" />
        <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2.5 border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton color="neutral" variant="outline" class="rounded-lg bg-white text-sm font-semibold text-ink" @click="close">Cancel</UButton>
        <UButton class="rounded-lg text-sm font-semibold" :loading="pending" @click="create(close)">Create endpoint</UButton>
      </div>
    </template>
  </ModalShell>
</template>
