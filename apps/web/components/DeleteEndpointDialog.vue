<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <ModalShell :open="open" :width="420" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex flex-col items-center gap-4 px-8 pb-[26px] pt-8 text-center">
        <div class="flex items-center justify-center rounded-full bg-red-500/10 p-3.5">
          <UIcon name="i-lucide-trash-2" class="size-[26px] text-red-500" />
        </div>
        <h2 class="text-[20px] font-extrabold text-ink">Delete this endpoint?</h2>
        <p class="text-sm leading-[1.5] text-gray-500">
          This permanently removes <span class="font-medium text-ink">stripe-prod</span> and all 12,408 captured
          requests. This action cannot be undone.
        </p>
        <div class="flex w-full gap-2.5 pt-1.5">
          <UButton block color="neutral" variant="outline" class="rounded-[9px] bg-white py-2.5 text-sm font-semibold text-ink" @click="close">Cancel</UButton>
          <UButton block color="error" class="rounded-[9px] py-2.5 text-sm font-semibold" @click="close">Delete endpoint</UButton>
        </div>
      </div>
    </template>
  </ModalShell>
</template>
