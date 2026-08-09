<script setup lang="ts">
const open = ref(false)

const items = [
  { label: 'Profile settings', to: '/app/settings' },
  { label: 'API keys', to: '/app/settings/api-keys' },
  { label: 'Team', to: '/app/settings/team' },
  { label: 'Toggle theme', to: '' },
]
</script>

<template>
  <div class="relative">
    <button class="rounded-full ring-2 ring-white" @click="open = !open">
      <UAvatar src="https://i.pravatar.cc/64?img=13" size="md" />
    </button>

    <div v-if="open" class="fixed inset-0 z-30" @click="open = false" />

    <div
      v-if="open"
      class="absolute right-0 top-[calc(100%+8px)] z-40 w-[240px] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[0px_12px_32px_-4px_rgba(0,0,0,0.12)]"
    >
      <div class="flex flex-col gap-0.5 border-b border-[var(--color-line)] px-3.5 py-3">
        <p class="text-sm font-semibold text-ink">Rafli Al Farizqi</p>
        <p class="text-[12px] text-gray-500">codewithrafli@gmail.com</p>
      </div>
      <component
        :is="i.to ? 'NuxtLink' : 'button'"
        v-for="i in items"
        :key="i.label"
        :to="i.to || undefined"
        class="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-gray-50"
        @click="open = false"
      >
        <span class="size-1.5 rounded-full bg-gray-300" />
        <span class="text-[13px] font-medium text-ink">{{ i.label }}</span>
      </component>
      <button class="flex w-full items-center gap-2.5 border-t border-[var(--color-line)] px-3.5 py-2.5 text-left hover:bg-red-50" @click="open = false">
        <span class="size-1.5 rounded-full bg-red-500" />
        <span class="text-[13px] font-medium text-red-600">Sign out</span>
      </button>
    </div>
  </div>
</template>
