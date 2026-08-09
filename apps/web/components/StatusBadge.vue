<script setup lang="ts">
const props = defineProps<{ status: number | string; dot?: boolean }>()

const tone = computed(() => {
  const n = typeof props.status === 'number' ? props.status : parseInt(String(props.status), 10)
  if (n >= 200 && n < 300) return 'text-green-700 bg-green-500/12'
  if (n >= 300 && n < 400) return 'text-method-get bg-method-get/12'
  if (n >= 400 && n < 500) return 'text-amber-700 bg-amber-500/12'
  return 'text-red-700 bg-red-500/12'
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
    :class="tone"
  >
    <span v-if="dot" class="size-1.5 rounded-full bg-current" />
    <slot>{{ status }}</slot>
  </span>
</template>
