<script setup lang="ts">
const cols = [
  { title: 'Product', links: ['Features', 'CLI', 'Self-host', 'Changelog'] },
  { title: 'Resources', links: ['Docs', 'API Reference', 'Guides', 'Status'] },
  { title: 'Community', links: ['GitHub', 'Discord', 'X / Twitter', 'Contribute'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'License'] },
]
</script>

<template>
  <footer class="flex w-full flex-col items-center gap-10 border-t border-[var(--color-line)] bg-[#fafafb] px-12 pb-8 pt-14">
    <div class="flex w-full max-w-[1140px] items-start justify-between">
      <div class="flex flex-col gap-3.5">
        <AppLogo :size="24" class="[&_span]:text-[19px]" />
        <p class="text-sm leading-[1.55] text-gray-500">
          Self-hostable webhook inspector<br>& relay. MIT licensed.
        </p>
      </div>
      <div v-for="c in cols" :key="c.title" class="flex flex-col gap-3 text-sm">
        <p class="font-semibold text-ink">{{ c.title }}</p>
        <a v-for="l in c.links" :key="l" href="#" class="text-gray-500 hover:text-ink">{{ l }}</a>
      </div>
    </div>
    <div class="h-px w-full max-w-[1140px] bg-[var(--color-line)]" />
    <div class="flex w-full max-w-[1140px] items-center justify-between text-[13px] text-gray-500">
      <p>© 2026 Reqtap — MIT Licensed. Built by the community.</p>
      <div class="flex gap-[18px]">
        <a href="#" class="hover:text-ink">GitHub</a>
        <a href="#" class="hover:text-ink">Discord</a>
        <a href="#" class="hover:text-ink">X</a>
      </div>
    </div>
  </footer>
</template>
