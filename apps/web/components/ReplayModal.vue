<script setup lang="ts">
const props = defineProps<{ open?: boolean; requestId?: string }>()
const emit = defineEmits<{ 'update:open': [boolean]; replayed: [] }>()
const target = ref('localhost:3000')
const sent = ref(false)
const error = ref('')

async function replay(close: () => void) {
  if (!props.requestId) {
    error.value = 'Select a request first'
    return
  }

  sent.value = true
  error.value = ''

  try {
    await authFetch(`/api/requests/${props.requestId}/replay`, {
      method: 'POST',
      body: { targetUrl: target.value },
    })
    emit('replayed')
    close()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Replay failed'
  } finally {
    sent.value = false
  }
}
</script>

<template>
  <ModalShell :open="open" :width="440" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">Replay request</h2>
        <button class="text-gray-400 hover:text-ink" @click="close"><UIcon name="i-lucide-x" class="size-5" /></button>
      </div>
      <div class="flex flex-col gap-4 px-6 py-[22px]">
        <p class="text-[13px] text-gray-500">Resend this captured request to a target URL.</p>
        <FormField v-model="target" label="Target URL" placeholder="localhost:3000/webhooks" />
        <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2.5 border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton color="neutral" variant="outline" class="rounded-lg bg-white text-sm font-semibold text-ink" @click="close">Cancel</UButton>
        <UButton
          icon="i-lucide-rotate-ccw"
          class="rounded-lg text-sm font-semibold"
          :loading="sent"
          @click="replay(close)"
        >{{ sent ? 'Sending…' : 'Replay' }}</UButton>
      </div>
    </template>
  </ModalShell>
</template>
