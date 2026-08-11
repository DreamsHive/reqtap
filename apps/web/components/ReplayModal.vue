<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()
const target = ref('localhost:3000')
const sent = ref(false)

function replay(close: () => void) {
  sent.value = true
  setTimeout(() => {
    sent.value = false
    close()
  }, 1200)
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
        <p class="text-[13px] text-gray-500">Resend <span class="font-semibold text-ink">POST /webhooks/stripe</span> to a target URL.</p>
        <FormField v-model="target" label="Target URL" placeholder="localhost:3000/webhooks" />
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
