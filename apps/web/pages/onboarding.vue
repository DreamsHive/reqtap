<script setup lang="ts">
useHead({ title: 'Get started · Reqtap' })

const url = 'reqtap.dev/t/abc123'
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(`https://${url}`)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center bg-canvas px-4">
    <AuroraBg />

    <div class="relative w-[560px] overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-white shadow-[0px_24px_56px_-12px_rgba(0,0,0,0.07)]">
      <!-- Progress header -->
      <div class="flex flex-col gap-3 px-9 pt-7">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold tracking-[1.2px] text-brand-500">STEP 2 OF 3</span>
          <span class="text-[12px] font-medium text-gray-400">Send a webhook</span>
        </div>
        <div class="flex gap-1.5">
          <span class="h-1 flex-1 rounded-full bg-brand-500" />
          <span class="h-1 flex-1 rounded-full bg-brand-500" />
          <span class="h-1 flex-1 rounded-full bg-[var(--color-line)]" />
        </div>
      </div>

      <!-- Body -->
      <div class="flex flex-col items-center gap-6 px-9 py-7">
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-[26px] font-extrabold text-ink">Send your first webhook</h1>
          <p class="text-sm text-gray-500">Point any provider at this URL — it shows up here instantly.</p>
        </div>

        <div class="flex w-full items-center gap-2.5 rounded-xl border border-brand-500/35 bg-brand-500/[0.06] py-2 pl-4 pr-2">
          <span class="rt-mono flex-1 text-[15px] font-semibold text-brand-500">reqtap.dev/t/abc123</span>
          <UButton icon="i-lucide-copy" class="rounded-lg text-[13px] font-semibold" @click="copy">{{ copied ? '✓ Copied!' : 'Copy' }}</UButton>
        </div>

        <div class="w-full overflow-hidden rounded-xl border border-[#26262e] bg-[#0c0c12]">
          <div class="flex items-center gap-1.5 border-b border-[#26262e] bg-[#15151c] px-3.5 py-2.5">
            <span class="size-[9px] rounded-full bg-[#ff5f57]" />
            <span class="size-[9px] rounded-full bg-[#febc2e]" />
            <span class="size-[9px] rounded-full bg-[#28c840]" />
            <span class="pl-1.5 text-[11px] text-gray-500">or test it from your terminal</span>
          </div>
          <div class="rt-mono flex flex-col gap-[3px] px-4 py-3.5 text-[13px] leading-[1.65]">
            <p><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">curl -sX POST reqtap.dev/t/abc123 \</span></p>
            <p><span class="text-[#7ee787]">&nbsp;&nbsp;-d '{"hello":"reqtap"}'</span></p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-[var(--color-line)] bg-subtle px-9 pb-5 pt-[18px]">
        <span class="flex items-center gap-2 text-[13px] font-medium text-gray-500">
          <span class="size-2 animate-pulse rounded-full bg-amber-400" /> Listening…
        </span>
        <div class="flex items-center gap-2">
          <UButton to="/app" variant="ghost" color="neutral" class="rounded-[9px] text-[13px] font-medium text-gray-500">Skip for now</UButton>
          <UButton
            to="/app"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-[9px] bg-gradient-to-r from-brand-500 to-violet-500 text-[13px] font-semibold"
          >Continue</UButton>
        </div>
      </div>
    </div>
  </div>
</template>
