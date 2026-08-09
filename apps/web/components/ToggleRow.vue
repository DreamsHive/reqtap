<script setup lang="ts">
defineProps<{ title: string; description?: string; modelValue?: boolean }>()
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex flex-col gap-0.5">
      <p class="text-sm font-medium text-ink">{{ title }}</p>
      <p v-if="description" class="text-[12px] text-gray-500">{{ description }}</p>
    </div>
    <button
      class="relative h-6 w-[42px] shrink-0 rounded-full transition-colors"
      :class="modelValue ? 'bg-brand-500' : 'bg-gray-300'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-all"
        :class="modelValue ? 'left-[20px]' : 'left-0.5'"
      />
    </button>
  </div>
</template>
