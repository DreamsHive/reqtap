<script setup lang="ts">
defineProps<{
  label: string
  value: string
  delta?: string
  deltaUp?: boolean
  bars?: number[]
}>()
</script>

<template>
  <div class="flex flex-1 flex-col gap-2.5 rounded-[14px] border border-[var(--color-line)] bg-white px-5 py-[18px]">
    <p class="text-[13px] font-medium text-gray-500">{{ label }}</p>
    <div class="flex items-baseline gap-2">
      <span class="text-[28px] font-extrabold text-ink">{{ value }}</span>
      <span
        v-if="delta"
        class="text-[12px] font-semibold"
        :class="deltaUp === false ? 'text-red-600' : 'text-green-700'"
      >
        {{ deltaUp === false ? '▼' : '▲' }} {{ delta }}
      </span>
    </div>
    <div v-if="bars" class="flex items-end gap-1">
      <span
        v-for="(h, i) in bars"
        :key="i"
        class="w-2 rounded-[2px] bg-brand-500/50"
        :style="{ height: `${h}px` }"
      />
    </div>
  </div>
</template>
