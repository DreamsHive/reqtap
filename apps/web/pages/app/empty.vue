<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Waiting for requests · Reqtap' })

const url = 'https://reqtap.dev/t/abc123'
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-[22px] px-10 text-center">
    <div class="flex items-center justify-center rounded-full bg-brand-500/10 p-5">
      <UIcon name="i-lucide-rss" class="size-8 text-brand-500" />
    </div>
    <h1 class="text-[26px] font-extrabold text-ink">Waiting for your first request</h1>
    <p class="text-[15px] text-gray-500">Send any webhook to the URL below and it'll appear here instantly.</p>

    <div class="flex w-[520px] items-center gap-2.5 rounded-[10px] border border-[var(--color-line)] bg-white py-2 pl-4 pr-2">
      <span class="rt-mono flex-1 text-left text-sm font-medium text-brand-500">{{ url }}</span>
      <UButton class="rounded-lg text-[13px] font-semibold" @click="copy">
        {{ copied ? '✓ Copied!' : 'Copy' }}
      </UButton>
    </div>

    <p class="text-[12px] font-medium text-gray-400">Or send a test request:</p>
    <div class="rt-mono w-[520px] rounded-xl bg-[#0c0c12] px-[18px] py-4 text-left text-[13px] leading-relaxed">
      <p><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">curl -X POST https://reqtap.dev/t/abc123 \</span></p>
      <p><span class="text-[#a78bfa]">&nbsp;&nbsp;-H 'Content-Type: application/json' \</span></p>
      <p><span class="text-[#7ee787]">&nbsp;&nbsp;-d '{"hello":"world"}'</span></p>
    </div>
  </div>
</template>
