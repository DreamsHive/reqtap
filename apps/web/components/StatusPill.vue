<script setup lang="ts">
// Small rounded pill with a leading dot — used for Active/Paused/result states.
withDefaults(
  defineProps<{ tone?: 'success' | 'danger' | 'neutral' }>(),
  { tone: 'neutral' },
)

const map = {
  success: 'text-green-700 bg-green-500/12',
  danger: 'text-red-700 bg-red-500/12',
  neutral: 'text-gray-500 bg-gray-400/15',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full py-1 pl-[9px] pr-2.5 text-[12px] font-semibold"
    :class="map[tone]"
  >
    <span class="size-1.5 rounded-full bg-current" />
    <slot />
  </span>
</template>
