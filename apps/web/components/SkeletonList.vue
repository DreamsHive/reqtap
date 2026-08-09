<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="n in rows"
      :key="n"
      class="flex flex-col gap-2 border-b border-[var(--color-line)] px-4 py-3.5"
    >
      <div class="flex items-center gap-2">
        <div class="h-4 w-10 animate-pulse rounded-md bg-gray-200" />
        <div class="h-3.5 flex-1 animate-pulse rounded bg-gray-200" />
        <div class="h-3.5 w-8 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
</template>
