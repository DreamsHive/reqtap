<script setup lang="ts">
import { primaryNav } from '~/composables/useNav'

const route = useRoute()
const paletteOpen = ref(false)

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-canvas">
    <!-- Topbar -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-[var(--color-line)] bg-white px-5 py-3"
    >
      <AppLogo />
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] bg-subtle px-3 py-1.5 text-[13px] text-gray-400 hover:bg-gray-100"
          @click="paletteOpen = true"
        >
          <UIcon name="i-lucide-search" class="size-4" />
          <span>Search…</span>
          <kbd class="rt-mono rounded bg-white px-1.5 py-0.5 text-[11px] text-gray-500 ring-1 ring-[var(--color-line)]">⌘K</kbd>
        </button>
        <UAvatar
          src="https://i.pravatar.cc/64?img=13"
          size="md"
          class="ring-2 ring-white"
        />
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1 items-stretch overflow-hidden">
      <AppSidebar />
      <main class="flex-1 overflow-y-auto pb-16 md:pb-0">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--color-line)] bg-white px-8 pb-5 pt-3.5 md:hidden">
      <NuxtLink
        v-for="item in primaryNav"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center"
        :class="route.path.startsWith(item.to) && (item.to !== '/app' || route.path === '/app') ? 'text-brand-500' : 'text-gray-400'"
      >
        <UIcon :name="item.icon" class="size-6" />
      </NuxtLink>
    </nav>

    <CommandPalette v-model:open="paletteOpen" />
  </div>
</template>
