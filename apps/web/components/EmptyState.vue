<script setup lang="ts">
withDefaults(
  defineProps<{ icon?: string; title: string; description?: string }>(),
  { icon: 'i-lucide-inbox' },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3.5 px-8 text-center">
    <div class="flex items-center justify-center rounded-full border border-[var(--color-line)] bg-subtle p-4">
      <UIcon :name="icon" class="size-7 text-gray-400" />
    </div>
    <p class="text-base font-semibold text-ink">{{ title }}</p>
    <p v-if="description" class="text-[13px] text-gray-500">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
