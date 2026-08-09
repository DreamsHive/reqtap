<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center bg-canvas px-4">
    <AuroraBg />
    <div class="relative flex w-[440px] flex-col items-center gap-5 rounded-[20px] border border-[var(--color-line)] bg-white px-10 pb-9 pt-10 shadow-[0px_20px_50px_-10px_rgba(0,0,0,0.08)]">
      <AppLogo :size="30" class="[&_span]:text-[22px]" />
      <h1 class="text-center text-2xl font-extrabold text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="text-center text-sm text-gray-500">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>
