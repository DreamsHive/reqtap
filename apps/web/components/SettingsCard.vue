<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="w-full overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
    <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
      <h2 class="text-[15px] font-semibold text-ink">{{ title }}</h2>
    </div>
    <div class="flex flex-col gap-[18px] px-[22px] pb-[22px] pt-5">
      <slot />
    </div>
  </div>
</template>
