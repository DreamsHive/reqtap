<script setup lang="ts">
defineProps<{ label: string; type?: string; placeholder?: string; modelValue?: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="flex w-full flex-col gap-[7px]">
    <label class="text-[13px] font-medium text-ink">{{ label }}</label>
    <input
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
