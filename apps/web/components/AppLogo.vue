<script setup lang="ts">
withDefaults(defineProps<{ size?: number; showText?: boolean }>(), {
  size: 22,
  showText: true,
})
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2">
    <UIcon
      name="i-lucide-webhook"
      class="text-brand-500"
      :style="{ fontSize: `${size}px` }"
    />
    <span v-if="showText" class="text-[17px] font-extrabold text-ink">Reqtap</span>
  </NuxtLink>
</template>
