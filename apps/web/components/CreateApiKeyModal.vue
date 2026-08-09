<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <ModalShell :open="open" :width="460" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">API key created</h2>
        <button class="text-gray-400 hover:text-ink" @click="close"><UIcon name="i-lucide-x" class="size-5" /></button>
      </div>
      <div class="flex flex-col gap-[18px] px-6 py-[22px]">
        <div class="flex items-start gap-2.5 rounded-[10px] border border-amber-500/40 bg-amber-500/10 px-3.5 py-3">
          <UIcon name="i-lucide-triangle-alert" class="size-[18px] shrink-0 text-amber-600" />
          <p class="flex-1 text-[13px] font-medium leading-[1.45] text-amber-700">Copy this key now — you won't be able to see it again.</p>
        </div>
        <div class="flex flex-col gap-[7px]">
          <label class="text-[13px] font-medium text-ink">Secret key</label>
          <div class="flex items-center gap-2.5 rounded-[9px] bg-[#0c0c12] py-2 pl-3.5 pr-2">
            <span class="rt-mono flex-1 text-[13px] text-[#e7e7ec]">rqx_live_9f2a7c4e1b8d3056af99</span>
            <UButton class="rounded-md text-[13px] font-semibold">Copy</UButton>
          </div>
        </div>
      </div>
      <div class="flex justify-end border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton class="rounded-lg text-sm font-semibold" @click="close">Done</UButton>
      </div>
    </template>
  </ModalShell>
</template>
