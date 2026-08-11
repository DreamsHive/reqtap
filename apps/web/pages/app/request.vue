<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Request · Reqtap' })
const showForward = ref(false)
const showReplay = ref(false)

const tabs = ['Body', 'Headers', 'Query']
const activeTab = ref('Body')

const bodyLines = [
  { t: '{', c: 'text-[#8b949e]' },
  { t: '  "id": "evt_1P9x…",', c: 'text-[#e7e7ec]' },
  { t: '  "type": "payment_intent', c: 'text-[#a78bfa]' },
  { t: '    .succeeded",', c: 'text-[#a78bfa]' },
  { t: '  "amount": 4200,', c: 'text-[#7ee787]' },
  { t: '  "currency": "usd"', c: 'text-[#7ee787]' },
  { t: '}', c: 'text-[#8b949e]' },
]
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white">
    <!-- Header -->
    <header class="flex items-center gap-3 border-b border-[var(--color-line)] px-4 pb-3.5 pt-4">
      <NuxtLink to="/app/inspector" class="text-ink">
        <UIcon name="i-lucide-arrow-left" class="size-[22px]" />
      </NuxtLink>
      <MethodBadge method="POST" />
      <span class="flex-1 truncate text-[15px] font-semibold text-ink">/webhooks/stripe</span>
    </header>

    <div class="flex flex-1 flex-col gap-3.5 p-4">
      <StatusBadge :status="200" dot>Signature verified · 200 · 42ms</StatusBadge>

      <div class="flex gap-5 border-b border-[var(--color-line)]">
        <button
          v-for="t in tabs"
          :key="t"
          class="pb-2.5 text-sm font-medium transition-colors"
          :class="activeTab === t ? 'border-b-2 border-brand-500 font-semibold text-ink' : 'text-gray-500'"
          @click="activeTab = t"
        >{{ t }}</button>
      </div>

      <div class="rt-mono flex flex-1 flex-col gap-[3px] rounded-xl bg-[#0c0c12] p-4 text-[13px] leading-[1.7]">
        <p v-for="(l, i) in bodyLines" :key="i" :class="l.c" class="whitespace-pre">{{ l.t }}</p>
      </div>

      <div class="flex flex-col gap-2.5">
        <UButton
          block
          icon="i-lucide-arrow-right"
          class="rounded-[10px] py-3.5 text-sm font-semibold"
          @click="showForward = true"
        >Forward to localhost</UButton>
        <UButton
          block
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          class="rounded-[10px] bg-white py-3.5 text-sm font-semibold text-ink"
          @click="showReplay = true"
        >Replay</UButton>
      </div>
    </div>

    <ConnectCliModal v-model:open="showForward" />
    <ReplayModal v-model:open="showReplay" />
  </div>
</template>
