<script setup lang="ts">
import type { DocsPage } from '~/composables/useDocs'

const props = defineProps<{
  page: DocsPage
}>()

const route = useRoute()
const pager = computed(() => docsPager(props.page.slug))

function isActive(slug: string) {
  return docsPath(slug) === route.path
}
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <header class="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-line)] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
      <div class="flex items-center gap-2">
        <AppLogo />
        <span class="rounded-md bg-brand-500/10 px-2 py-[3px] text-[12px] font-semibold text-brand-500">Docs</span>
      </div>
      <nav class="hidden items-center gap-6 text-sm font-medium text-gray-500 md:flex">
        <NuxtLink to="/docs/quick-start" class="hover:text-ink">Quick start</NuxtLink>
        <NuxtLink to="/docs/api" class="hover:text-ink">API</NuxtLink>
        <NuxtLink to="/docs/cli" class="hover:text-ink">CLI</NuxtLink>
        <NuxtLink to="/app/inspector" class="hover:text-ink">Dashboard</NuxtLink>
        <a href="https://github.com/DreamsHive/reqtap" target="_blank" rel="noopener noreferrer" class="hover:text-ink">GitHub</a>
      </nav>
    </header>

    <div class="mx-auto flex w-full max-w-[1240px] items-start">
      <aside class="sticky top-[65px] hidden h-[calc(100vh-65px)] w-[270px] shrink-0 overflow-y-auto border-r border-[var(--color-line)] px-5 py-7 lg:flex lg:flex-col lg:gap-1.5">
        <template v-for="group in docsGroups" :key="group.section">
          <p class="px-2.5 pb-1 pt-3 text-[11px] font-semibold tracking-[1px] text-gray-400">{{ group.section }}</p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.slug"
            :to="docsPath(item.slug)"
            class="rounded-[7px] px-2.5 py-[7px] text-[13px] font-medium transition-colors"
            :class="isActive(item.slug) ? 'bg-brand-500/10 text-brand-600' : 'text-gray-500 hover:bg-gray-100 hover:text-ink'"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
      </aside>

      <main class="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
        <article class="mx-auto flex max-w-[820px] flex-col gap-7 pb-12">
          <header>
            <p v-if="page.eyebrow" class="text-sm font-semibold uppercase tracking-[1.5px] text-brand-500">{{ page.eyebrow }}</p>
            <h1 class="mt-3 text-[34px] font-extrabold leading-tight text-ink sm:text-[42px]">{{ page.title }}</h1>
            <p class="mt-4 text-[17px] leading-[1.65] text-gray-500">{{ page.description }}</p>
          </header>

          <template v-for="(block, index) in page.blocks" :key="index">
            <p v-if="block.type === 'paragraph'" class="text-[15px] leading-[1.75] text-gray-600">
              {{ block.text }}
            </p>

            <div v-else-if="block.type === 'code'" class="rt-mono overflow-x-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.8]">
              <p v-for="line in block.lines" :key="line">
                <span class="font-semibold text-brand-400">$ </span>
                <span class="whitespace-pre text-[#e7e7ec]">{{ line }}</span>
              </p>
            </div>

            <div
              v-else-if="block.type === 'callout'"
              class="rounded-[10px] border px-4 py-3 text-[13px] leading-[1.65]"
              :class="block.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-[var(--color-line)] bg-white text-gray-600'"
            >
              {{ block.text }}
            </div>

            <div v-else-if="block.type === 'cards'" class="grid gap-3 sm:grid-cols-2">
              <template v-for="card in block.items" :key="card.title">
                <NuxtLink
                  v-if="card.to"
                  :to="card.to"
                  class="rounded-[10px] border border-[var(--color-line)] bg-white p-4 transition-colors hover:border-brand-500/40 hover:bg-brand-500/[0.03]"
                >
                  <UIcon :name="card.icon" class="size-5 text-brand-500" />
                  <p class="mt-3 text-sm font-semibold">{{ card.title }}</p>
                  <p class="mt-1 text-[13px] leading-[1.55] text-gray-500">{{ card.body }}</p>
                </NuxtLink>
                <div v-else class="rounded-[10px] border border-[var(--color-line)] bg-white p-4">
                  <UIcon :name="card.icon" class="size-5 text-brand-500" />
                  <p class="mt-3 text-sm font-semibold">{{ card.title }}</p>
                  <p class="mt-1 text-[13px] leading-[1.55] text-gray-500">{{ card.body }}</p>
                </div>
              </template>
            </div>

            <div v-else-if="block.type === 'table'" class="overflow-x-auto rounded-[10px] border border-[var(--color-line)] bg-white">
              <div
                class="grid min-w-[720px] border-b border-[var(--color-line)] bg-subtle px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.3px] text-gray-500"
                :style="{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(140px, 1fr))` }"
              >
                <span v-for="column in block.columns" :key="column">{{ column }}</span>
              </div>
              <div
                v-for="row in block.rows"
                :key="block.columns.map((column) => row[column]).join('-')"
                class="grid min-w-[720px] gap-3 border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
                :style="{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(140px, 1fr))` }"
              >
                <template v-for="column in block.columns" :key="column">
                  <MethodBadge v-if="block.badgeColumn === column" :method="row[column]" class="w-fit" />
                  <span v-else class="break-words text-gray-600" :class="column === 'path' || column === 'command' || column === 'variable' || column === 'example' || column === 'value' ? 'rt-mono font-medium text-ink' : ''">
                    {{ row[column] }}
                  </span>
                </template>
              </div>
            </div>

            <NuxtLink
              v-else-if="block.type === 'cta'"
              :to="block.to"
              class="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {{ block.label }}
              <UIcon :name="block.icon || 'i-lucide-arrow-right'" class="size-4" />
            </NuxtLink>
          </template>

          <footer class="mt-4 grid gap-3 border-t border-[var(--color-line)] pt-5 sm:grid-cols-2">
            <NuxtLink
              v-if="pager.previous"
              :to="docsPath(pager.previous.slug)"
              class="rounded-[10px] border border-[var(--color-line)] bg-white p-4 text-sm hover:bg-gray-50"
            >
              <span class="text-xs font-semibold uppercase tracking-[0.7px] text-gray-400">Previous</span>
              <p class="mt-1 font-semibold text-ink">{{ pager.previous.title }}</p>
            </NuxtLink>
            <div v-else />
            <NuxtLink
              v-if="pager.next"
              :to="docsPath(pager.next.slug)"
              class="rounded-[10px] border border-[var(--color-line)] bg-white p-4 text-right text-sm hover:bg-gray-50"
            >
              <span class="text-xs font-semibold uppercase tracking-[0.7px] text-gray-400">Next</span>
              <p class="mt-1 font-semibold text-ink">{{ pager.next.title }}</p>
            </NuxtLink>
          </footer>
        </article>
      </main>
    </div>
  </div>
</template>
