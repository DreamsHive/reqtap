<script setup lang="ts">
const GH = 'https://github.com/DreamsHive/reqtap'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'CLI', to: '/#cli' },
      { label: 'Self-host', to: '/#self-host' },
      { label: 'Changelog', to: '/changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', to: '/docs' },
      { label: 'API Reference', to: '/docs' },
      { label: 'Guides', to: '/docs' },
      { label: 'Status', to: GH, ext: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', to: GH, ext: true },
      { label: 'Discord', to: GH, ext: true },
      { label: 'X / Twitter', to: GH, ext: true },
      { label: 'Contribute', to: GH, ext: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: GH, ext: true },
      { label: 'Terms', to: GH, ext: true },
      { label: 'License', to: GH + '/blob/main/LICENSE', ext: true },
    ],
  },
]
</script>

<template>
  <footer class="flex w-full flex-col items-center gap-10 border-t border-[var(--color-line)] bg-[#fafafb] px-12 pb-8 pt-14">
    <div class="flex w-full max-w-[1140px] flex-wrap items-start justify-between gap-8">
      <div class="flex flex-col gap-3.5">
        <AppLogo :size="24" class="[&_span]:text-[19px]" />
        <p class="text-sm leading-[1.55] text-gray-500">
          Self-hostable webhook inspector<br>& relay. MIT licensed.
        </p>
      </div>
      <div v-for="c in cols" :key="c.title" class="flex flex-col gap-3 text-sm">
        <p class="font-semibold text-ink">{{ c.title }}</p>
        <component
          :is="l.ext ? 'a' : 'NuxtLink'"
          v-for="l in c.links"
          :key="l.label"
          :href="l.ext ? l.to : undefined"
          :to="!l.ext ? l.to : undefined"
          :target="l.ext ? '_blank' : undefined"
          :rel="l.ext ? 'noopener noreferrer' : undefined"
          class="text-gray-500 hover:text-ink"
        >{{ l.label }}</component>
      </div>
    </div>
    <div class="h-px w-full max-w-[1140px] bg-[var(--color-line)]" />
    <div class="flex w-full max-w-[1140px] items-center justify-between text-[13px] text-gray-500">
      <p>© 2026 Reqtap — MIT Licensed. Built by the community.</p>
      <div class="flex gap-[18px]">
        <a :href="GH" target="_blank" rel="noopener noreferrer" class="hover:text-ink">GitHub</a>
        <a :href="GH" target="_blank" rel="noopener noreferrer" class="hover:text-ink">Discord</a>
        <a :href="GH" target="_blank" rel="noopener noreferrer" class="hover:text-ink">X</a>
      </div>
    </div>
  </footer>
</template>
