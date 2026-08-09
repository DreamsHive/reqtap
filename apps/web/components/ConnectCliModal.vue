<script setup lang="ts">
defineProps<{ open?: boolean }>()
defineEmits<{ 'update:open': [boolean] }>()

const steps = [
  { n: 1, title: 'Install the CLI', desc: 'Run it instantly with npx — no install needed.', cmd: 'npx @reqtap/cli login' },
  { n: 2, title: 'Forward this endpoint', desc: 'Point incoming webhooks to your local server.', cmd: 'npx wh forward abc123 --to localhost:3000' },
]
</script>

<template>
  <ModalShell :open="open" :width="540" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">Forward to your localhost</h2>
        <button class="text-gray-400 hover:text-ink" @click="close">
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>
      <div class="flex flex-col gap-5 px-6 py-[22px]">
        <div v-for="s in steps" :key="s.n" class="flex gap-3.5">
          <div class="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-[13px] font-semibold text-brand-500">{{ s.n }}</div>
          <div class="flex flex-1 flex-col gap-2">
            <p class="text-sm font-semibold text-ink">{{ s.title }}</p>
            <p class="text-[13px] text-gray-500">{{ s.desc }}</p>
            <div class="flex items-center justify-between rounded-[9px] bg-[#0c0c12] py-3 pl-4 pr-2.5">
              <span class="rt-mono text-[13px]"><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">{{ s.cmd }}</span></span>
              <button class="rounded-md bg-white/[0.08] px-2.5 py-1.5 text-[12px] font-medium text-[#e7e7ec] hover:bg-white/15">Copy</button>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2.5 rounded-[10px] border border-[var(--color-line)] bg-subtle px-4 py-3.5">
          <span class="size-[9px] animate-pulse rounded-full bg-amber-400" />
          <span class="text-[13px] font-medium text-gray-500">Waiting for the CLI to connect…</span>
        </div>
      </div>
    </template>
  </ModalShell>
</template>
