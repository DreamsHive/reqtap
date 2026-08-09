<script setup lang="ts">
defineProps<{ open?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const query = ref('stripe')

const endpoints = [
  { icon: 'i-lucide-webhook', name: 'stripe-prod', meta: '/t/abc123 · 842k', active: true },
  { icon: 'i-lucide-webhook', name: 'stripe-staging', meta: '/t/stg991 · 12k' },
]
const actions = [
  { icon: 'i-lucide-plus', name: 'Create new endpoint' },
  { icon: 'i-lucide-arrow-right', name: 'Forward to localhost', kbd: '⌘F' },
  { icon: 'i-lucide-moon', name: 'Toggle dark mode' },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[110px]"
      @click.self="emit('update:open', false)"
    >
      <div class="w-[640px] max-w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[0px_24px_60px_-8px_rgba(0,0,0,0.25)]">
        <!-- Search -->
        <div class="flex items-center gap-3 border-b border-[var(--color-line)] py-4 pl-[18px] pr-4">
          <UIcon name="i-lucide-search" class="size-[18px] text-gray-400" />
          <input v-model="query" class="flex-1 bg-transparent text-base text-ink focus:outline-none" placeholder="Search…">
          <kbd class="rounded-[5px] border border-[var(--color-line)] bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-gray-500">ESC</kbd>
        </div>

        <!-- Endpoints -->
        <div class="flex flex-col px-1.5 py-2">
          <p class="px-3 py-1.5 text-[11px] font-semibold tracking-[0.8px] text-gray-400">ENDPOINTS</p>
          <button
            v-for="e in endpoints"
            :key="e.name"
            class="flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-left"
            :class="e.active ? 'bg-brand-500/[0.08]' : 'hover:bg-gray-50'"
          >
            <UIcon :name="e.icon" class="size-[18px] text-gray-500" />
            <span class="text-sm font-medium text-ink">{{ e.name }}</span>
            <span class="flex-1" />
            <span class="rt-mono text-[12px] text-gray-400">{{ e.meta }}</span>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex flex-col px-1.5 py-2">
          <p class="px-3 py-1.5 text-[11px] font-semibold tracking-[0.8px] text-gray-400">ACTIONS</p>
          <button
            v-for="a in actions"
            :key="a.name"
            class="flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-left hover:bg-gray-50"
          >
            <UIcon :name="a.icon" class="size-[18px] text-gray-500" />
            <span class="text-sm font-medium text-ink">{{ a.name }}</span>
            <span class="flex-1" />
            <span v-if="a.kbd" class="text-[12px] text-gray-400">{{ a.kbd }}</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3.5 border-t border-[var(--color-line)] bg-subtle px-[18px] py-3 text-[12px] text-gray-500">
          <span class="flex items-center gap-1.5">
            <kbd class="rounded-[5px] border border-[var(--color-line)] bg-subtle px-1.5 py-0.5 text-[11px]">↑</kbd>
            <kbd class="rounded-[5px] border border-[var(--color-line)] bg-subtle px-1.5 py-0.5 text-[11px]">↓</kbd>
            Navigate
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="rounded-[5px] border border-[var(--color-line)] bg-subtle px-1.5 py-0.5 text-[11px]">↵</kbd>
            Open
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
