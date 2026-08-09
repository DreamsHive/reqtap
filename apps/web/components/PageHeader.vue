<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-1">
      <h1 class="text-[26px] font-extrabold text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
