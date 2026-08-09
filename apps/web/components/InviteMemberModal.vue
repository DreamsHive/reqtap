<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()
const email = ref('')
const role = ref('Member')
const message = ref('')
</script>

<template>
  <ModalShell :open="open" :width="460" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">Invite a member</h2>
        <button class="text-gray-400 hover:text-ink" @click="close"><UIcon name="i-lucide-x" class="size-5" /></button>
      </div>
      <div class="flex flex-col gap-[18px] px-6 py-[22px]">
        <FormField v-model="email" label="Email address" placeholder="teammate@company.com" />
        <FormField v-model="role" label="Role" select />
        <FormField v-model="message" label="Message (optional)" placeholder="Come help us tame webhooks 👋" />
      </div>
      <div class="flex justify-end gap-2.5 border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton color="neutral" variant="outline" class="rounded-lg bg-white text-sm font-semibold text-ink" @click="close">Cancel</UButton>
        <UButton class="rounded-lg text-sm font-semibold" @click="close">Send invite</UButton>
      </div>
    </template>
  </ModalShell>
</template>
