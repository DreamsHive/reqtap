<script setup lang="ts">
withDefaults(
  defineProps<{
    open?: boolean
    endpointName?: string
    requestCount?: number
    pending?: boolean
  }>(),
  {
    endpointName: 'this endpoint',
    requestCount: 0,
    pending: false,
  }
)
const emit = defineEmits<{ 'update:open': [boolean]; confirm: [] }>()
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
          This permanently removes <span class="font-medium text-ink">{{ endpointName }}</span> and all
          {{ requestCount.toLocaleString() }} captured requests. This action cannot be undone.
        </p>
        <div class="flex w-full gap-2.5 pt-1.5">
          <UButton block color="neutral" variant="outline" class="rounded-[9px] bg-white py-2.5 text-sm font-semibold text-ink" @click="close">Cancel</UButton>
          <UButton block color="error" class="rounded-[9px] py-2.5 text-sm font-semibold" :loading="pending" @click="emit('confirm')">Delete endpoint</UButton>
        </div>
      </div>
    </template>
  </ModalShell>
</template>
