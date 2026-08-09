<script setup lang="ts">
const links = [
  { label: 'Features', to: '/#features' },
  { label: 'Docs', to: '/docs' },
  { label: 'CLI', to: '/#cli' },
  { label: 'Self-host', to: '/#self-host' },
]
</script>

<template>
  <nav class="flex w-full items-center justify-between px-10 py-[22px]">
    <AppLogo :size="26" class="[&_span]:text-[20px]" />
    <div class="flex items-center gap-7">
      <NuxtLink
        v-for="l in links"
        :key="l.label"
        :to="l.to"
        class="text-sm font-medium text-gray-500 hover:text-ink"
      >{{ l.label }}</NuxtLink>
      <UButton
        to="https://github.com/DreamsHive/reqtap"
        target="_blank"
        icon="i-lucide-star"
        class="rounded-lg bg-ink text-sm font-semibold text-white hover:bg-ink/90"
      >GitHub</UButton>
    </div>
  </nav>
</template>
