<script setup lang="ts">
defineProps<{
  label: string
  modelValue?: string
  placeholder?: string
  select?: boolean
}>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <label class="text-[13px] font-medium text-ink">{{ label }}</label>
    <div class="flex items-center rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px]">
      <input
        :value="modelValue"
        :placeholder="placeholder"
        class="w-full bg-transparent text-sm text-ink placeholder:text-gray-400 focus:outline-none"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <UIcon v-if="select" name="i-lucide-chevron-down" class="size-3.5 text-gray-400" />
    </div>
  </div>
</template>
