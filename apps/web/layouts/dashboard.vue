<script setup lang="ts">
const emit = defineEmits<{ openPalette: [] }>()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <!-- Topbar -->
    <header
      class="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-5 py-3"
    >
      <AppLogo />
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] bg-subtle px-3 py-1.5 text-[13px] text-gray-400 hover:bg-gray-100"
          @click="emit('openPalette')"
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
      <main class="flex-1 overflow-y-auto px-8 py-7">
        <slot />
      </main>
    </div>
  </div>
</template>
