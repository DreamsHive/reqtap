<script setup lang="ts">
const links = [
  { label: 'Features', to: '/#features' },
  { label: 'Docs', to: '/docs' },
  { label: 'CLI', to: '/#cli' },
  { label: 'Self-host', to: '/#self-host' },
]
</script>

<template>
  <nav class="flex w-full items-center justify-between px-5 py-4 sm:px-10 sm:py-[22px]">
    <AppLogo :size="26" class="[&_span]:text-[20px]" />
    <div class="hidden items-center gap-7 md:flex">
      <NuxtLink
        v-for="l in links"
        :key="l.label"
        :to="l.to"
        class="text-sm font-medium text-gray-500 hover:text-ink"
      >{{ l.label }}</NuxtLink>
      <NuxtLink to="/auth/login" class="text-sm font-medium text-gray-500 hover:text-ink">Sign in</NuxtLink>
      <UButton
        to="/auth/register"
        class="rounded-lg bg-ink text-sm font-semibold text-white hover:bg-ink/90"
      >Get started</UButton>
    </div>
    <button class="text-ink md:hidden" aria-label="Menu">
      <UIcon name="i-lucide-menu" class="size-6" />
    </button>
  </nav>
</template>
