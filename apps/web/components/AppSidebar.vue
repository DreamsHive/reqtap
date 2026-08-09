<script setup lang="ts">
import { primaryNav, secondaryNav } from '~/composables/useNav'

const route = useRoute()

function isActive(to: string) {
  if (to === '/app') return route.path === '/app'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    class="hidden w-[230px] shrink-0 flex-col gap-1 border-r border-[var(--color-line)] bg-subtle px-3.5 py-4 md:flex"
  >
    <NuxtLink
      v-for="item in primaryNav"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm font-medium transition-colors"
      :class="
        isActive(item.to)
          ? 'bg-brand-500/10 text-brand-600 font-semibold'
          : 'text-gray-500 hover:bg-gray-100'
      "
    >
      <UIcon :name="item.icon" class="size-[18px]" />
      {{ item.label }}
    </NuxtLink>

    <div class="my-2 h-px w-full" />

    <NuxtLink
      v-for="item in secondaryNav"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm font-medium transition-colors"
      :class="
        isActive(item.to)
          ? 'bg-brand-500/10 text-brand-600 font-semibold'
          : 'text-gray-500 hover:bg-gray-100'
      "
    >
      <UIcon :name="item.icon" class="size-[18px]" />
      {{ item.label }}
    </NuxtLink>
  </aside>
</template>
