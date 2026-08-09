<script setup lang="ts">
const props = defineProps<{ method: string }>()

const styles: Record<string, string> = {
  GET: 'text-method-get bg-method-get/12',
  POST: 'text-brand-500 bg-brand-500/12',
  PUT: 'text-method-put bg-method-put/12',
  PATCH: 'text-method-put bg-method-put/12',
  DELETE: 'text-method-delete bg-method-delete/12',
}
const cls = computed(() => styles[props.method.toUpperCase()] ?? 'text-gray-500 bg-gray-100')
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
    :class="cls"
  >
    {{ method.toUpperCase() }}
  </span>
</template>
