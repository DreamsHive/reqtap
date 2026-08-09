<script setup lang="ts">
useHead({ title: 'Docs · Reqtap' })

const nav = [
  { section: 'GETTING STARTED', items: ['Introduction', 'Quick start', 'Self-hosting'] },
  { section: 'FEATURES', items: ['Inspecting requests', 'Forwarding (CLI)', 'Replaying', 'Signature verify'] },
  { section: 'REFERENCE', items: ['REST API', 'CLI commands', 'Webhooks'] },
]
const active = 'Quick start'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <!-- Docs header -->
    <header class="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-8 py-4">
      <div class="flex items-center gap-2">
        <AppLogo />
        <span class="rounded-md bg-brand-500/10 px-2 py-[3px] text-[12px] font-semibold text-brand-500">Docs</span>
      </div>
      <nav class="flex items-center gap-6 text-sm font-medium text-gray-500">
        <a href="#" class="hover:text-ink">Guides</a>
        <a href="#" class="hover:text-ink">API</a>
        <a href="#" class="hover:text-ink">CLI</a>
        <a href="#" class="hover:text-ink">GitHub</a>
      </nav>
    </header>

    <div class="flex flex-1">
      <!-- Docs sidebar -->
      <aside class="flex w-[260px] shrink-0 flex-col gap-1.5 border-r border-[var(--color-line)] px-6 py-7">
        <template v-for="group in nav" :key="group.section">
          <p class="px-2.5 pb-1 pt-2.5 text-[11px] font-semibold tracking-[1px] text-gray-400">{{ group.section }}</p>
          <a
            v-for="item in group.items"
            :key="item"
            href="#"
            class="rounded-[7px] px-2.5 py-[7px] text-[13px] transition-colors"
            :class="active === item ? 'bg-brand-500/10 font-semibold text-brand-500' : 'font-medium text-gray-500 hover:bg-gray-100'"
          >{{ item }}</a>
        </template>
      </aside>

      <!-- Content -->
      <main class="flex flex-1 justify-center overflow-y-auto">
        <article class="flex w-[680px] flex-col gap-[18px] py-10">
          <h1 class="text-[34px] font-extrabold text-ink">Quick start</h1>
          <p class="text-[17px] leading-[1.52] text-gray-500">
            Get Reqtap capturing and forwarding webhooks in under two minutes — hosted or self-hosted.
          </p>

          <h2 class="pt-3 text-xl font-semibold text-ink">1. Create an endpoint</h2>
          <p class="text-[15px] leading-[1.6] text-[#3f3f46]">
            Every endpoint gives you a unique URL. Point any provider (Stripe, GitHub, Shopify…) at it and requests
            stream into your dashboard instantly.
          </p>
          <div class="rt-mono flex flex-col gap-1 rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[14px]">
            <p><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">npx @reqtap/cli login</span></p>
            <p><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">npx wh new --name stripe-prod</span></p>
            <p><span class="font-semibold text-brand-500">✓ </span><span class="text-[#a78bfa]">https://reqtap.dev/t/abc123</span></p>
          </div>

          <h2 class="pt-3 text-xl font-semibold text-ink">2. Forward to localhost</h2>
          <p class="text-[15px] leading-[1.6] text-[#3f3f46]">
            Stream live requests straight to your dev server with a single command.
          </p>
          <div class="flex items-start gap-3 rounded-[10px] border border-brand-500/30 bg-brand-500/[0.06] px-4 py-3.5">
            <UIcon name="i-lucide-lightbulb" class="size-5 shrink-0 text-brand-500" />
            <div class="flex flex-col gap-0.5 text-[13px]">
              <p class="font-semibold text-brand-500">Tip</p>
              <p class="leading-[1.5] text-[#4338ca]">The CLI auto-reconnects, so your webhooks keep flowing even if your connection drops.</p>
            </div>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>
