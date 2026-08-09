<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()
const name = ref('')
const slug = ref('')
const provider = ref('No verification')
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
        <FormField v-model="provider" label="Verify signatures from" select />
      </div>
      <div class="flex justify-end gap-2.5 border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton color="neutral" variant="outline" class="rounded-lg bg-white text-sm font-semibold text-ink" @click="close">Cancel</UButton>
        <UButton class="rounded-lg text-sm font-semibold" @click="close">Create endpoint</UButton>
      </div>
    </template>
  </ModalShell>
</template>
