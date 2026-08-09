<script setup lang="ts">
definePageMeta({ layout: 'marketing' })
useHead({ title: 'Reqtap — Inspect, replay & forward webhooks' })

const requests = [
  { method: 'POST', path: '/webhooks/stripe', status: 200, time: '2s ago', active: true },
  { method: 'POST', path: '/webhooks/github', status: 200, time: '14s ago' },
  { method: 'POST', path: '/webhooks/shopify', status: 200, time: '1m ago' },
  { method: 'GET', path: '/webhooks/health', status: 200, time: '3m ago' },
  { method: 'POST', path: '/webhooks/stripe', status: 400, time: '5m ago' },
  { method: 'POST', path: '/webhooks/clerk', status: 200, time: '8m ago' },
]

const features = [
  { icon: 'i-lucide-eye', title: 'Real-time inspection', body: 'Requests appear the instant they arrive over WebSocket — no refresh, no polling.' },
  { icon: 'i-lucide-arrow-right', title: 'Forward to localhost', body: 'One command — npx wh forward — streams live webhooks straight to your dev server.' },
  { icon: 'i-lucide-repeat', title: 'Replay any request', body: 'Resend a captured payload as many times as you need to debug your handler.' },
  { icon: 'i-lucide-shield-check', title: 'Signature verification', body: 'Auto-detect & verify Stripe, GitHub and Shopify signatures with a clear pass/fail badge.' },
  { icon: 'i-lucide-search', title: 'Search & filter', body: 'Slice through thousands of requests by method, provider, status or payload contents.' },
  { icon: 'i-lucide-server', title: 'Self-host in one command', body: 'docker compose up and you own the whole stack. MIT licensed, no data leaves your box.' },
]

const body = [
  { t: '{', c: 'text-[#8b949e]' },
  { t: '  "id": "evt_1P9x…",', c: 'text-[#e7e7ec]' },
  { t: '  "type": "payment_intent.succeeded",', c: 'text-[#a78bfa]' },
  { t: '  "amount": 4200,', c: 'text-[#7ee787]' },
  { t: '  "currency": "usd",', c: 'text-[#7ee787]' },
  { t: '  "livemode": false', c: 'text-[#e7e7ec]' },
  { t: '}', c: 'text-[#8b949e]' },
]
</script>

<template>
  <div class="flex w-full flex-col items-center">
    <!-- Hero -->
    <section class="flex flex-col items-center gap-6 px-4 pt-16 text-center">
      <span class="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/75 px-3.5 py-[7px] text-[13px] font-medium text-gray-600 shadow-sm">
        <span class="size-[7px] rounded-full bg-green-500" />
        Open source · Self-hostable · MIT licensed
      </span>
      <h1 class="text-[38px] font-extrabold leading-[1.06] text-ink sm:text-[72px] sm:leading-[1.02]">
        Inspect, replay &amp;<br>
        <span class="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">forward webhooks.</span>
      </h1>
      <p class="w-[640px] max-w-full text-[15px] leading-[1.52] text-gray-500 sm:text-[18px] sm:leading-[1.55]">
        A self-hostable tool to capture webhooks, inspect them in real time, replay any request, and forward them
        straight to your localhost. webhook.site + smee.io in one box.
      </p>

      <!-- Terminal -->
      <div class="mt-2 w-[620px] max-w-full overflow-hidden rounded-[14px] border border-[#23232b] bg-[#0c0c12] text-left shadow-[0px_16px_44px_-8px_rgba(99,102,241,0.18)]">
        <div class="flex items-center gap-2 border-b border-[#23232b] bg-[#15151c] px-4 py-3">
          <span class="size-[11px] rounded-full bg-[#ff5f57]" />
          <span class="size-[11px] rounded-full bg-[#febc2e]" />
          <span class="size-[11px] rounded-full bg-[#28c840]" />
          <span class="rt-mono text-[12px] text-gray-500">zsh — reqtap</span>
        </div>
        <div class="rt-mono flex flex-col gap-2.5 px-5 pb-[22px] pt-5 text-[14px]">
          <p><span class="font-semibold text-brand-500">$ </span><span class="text-[#e7e7ec]">npx wh forward abc123 --to localhost:3000</span></p>
          <p class="text-[#8b5cf6]">→ POST /webhooks/stripe · 200 OK · 42ms</p>
          <p class="text-[#8b5cf6]">→ POST /webhooks/github · 200 OK · 31ms</p>
          <p class="text-[#a78bfa]">✓ Listening… forwarding live to localhost:3000</p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <UButton to="https://github.com/DreamsHive/reqtap" target="_blank" icon="i-lucide-star" size="lg" class="rounded-[9px] bg-gradient-to-r from-brand-500 to-violet-500 text-[15px] font-semibold">Star on GitHub</UButton>
        <UButton to="/docs" color="neutral" variant="outline" size="lg" class="rounded-[9px] bg-white text-[15px] font-semibold text-ink">Read the docs</UButton>
      </div>
    </section>

    <!-- Inspector preview -->
    <section class="flex w-full flex-col items-center gap-9 px-6 pb-10 pt-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <h2 class="text-[28px] font-extrabold text-ink sm:text-[38px]">Every request, decoded in real time</h2>
        <p class="w-[540px] max-w-full text-base leading-[1.5] text-gray-500">
          Headers, body, query and signatures — parsed and pretty-printed the moment a webhook lands.
        </p>
      </div>

      <div class="w-[1120px] max-w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[0px_26px_60px_-12px_rgba(0,0,0,0.09)]">
        <div class="flex items-center gap-2 border-b border-[var(--color-line)] bg-[#f7f7f9] px-4 py-3">
          <span class="size-[11px] rounded-full bg-[#ff5f57]" />
          <span class="size-[11px] rounded-full bg-[#febc2e]" />
          <span class="size-[11px] rounded-full bg-[#28c840]" />
          <div class="flex flex-1 items-center justify-center rounded-md border border-[var(--color-line)] bg-white py-1 text-[12px] text-gray-500">reqtap.dev/t/abc123</div>
          <div class="w-[50px]" />
        </div>
        <div class="flex flex-col md:flex-row">
          <!-- list -->
          <div class="w-full shrink-0 border-b border-r border-[var(--color-line)] bg-subtle md:w-[400px] md:border-b-0">
            <div class="flex items-center justify-between border-b border-[var(--color-line)] px-[18px] py-4">
              <span class="text-[15px] font-semibold text-ink">Requests</span>
              <StatusBadge :status="200" dot>Live</StatusBadge>
            </div>
            <div
              v-for="(r, i) in requests"
              :key="i"
              class="flex items-center gap-2.5 border-b border-[var(--color-line)] px-[18px] py-3.5"
              :class="r.active ? 'border-l-2 border-l-brand-500 bg-brand-500/[0.06]' : ''"
            >
              <MethodBadge :method="r.method" class="!px-1.5 !py-0.5 !text-[11px]" />
              <span class="flex-1 truncate text-[13px] font-medium text-ink">{{ r.path }}</span>
              <span class="text-[12px] font-semibold" :class="r.status < 400 ? 'text-green-600' : 'text-red-500'">{{ r.status }}</span>
              <span class="text-[11px] text-gray-400">{{ r.time }}</span>
            </div>
          </div>
          <!-- detail -->
          <div class="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
            <div class="flex items-center gap-2.5">
              <MethodBadge method="POST" />
              <span class="flex-1 text-[15px] font-semibold text-ink">/webhooks/stripe</span>
              <StatusBadge :status="200" dot>Stripe signature verified</StatusBadge>
            </div>
            <div class="flex gap-5 border-b border-[var(--color-line)]">
              <span class="border-b-2 border-brand-500 pb-2.5 text-sm font-semibold text-ink">Body</span>
              <span class="pb-2.5 text-sm font-medium text-gray-500">Headers</span>
              <span class="pb-2.5 text-sm font-medium text-gray-500">Query</span>
            </div>
            <div class="rt-mono flex flex-col gap-[3px] rounded-[10px] bg-[#0c0c12] px-[18px] py-4 text-[13px] leading-[1.65]">
              <p v-for="(l, i) in body" :key="i" :class="l.c" class="whitespace-pre">{{ l.t }}</p>
            </div>
            <UButton icon="i-lucide-repeat" class="w-fit rounded-lg text-[13px] font-semibold">Replay to localhost:3000</UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="flex w-full flex-col items-center gap-11 px-6 pb-16 pt-20">
      <div class="flex flex-col items-center gap-3.5 text-center">
        <span class="text-[13px] font-semibold tracking-[1.5px] text-brand-500">FEATURES</span>
        <h2 class="text-[30px] font-extrabold text-ink sm:text-[42px]">Everything you need to tame webhooks</h2>
      </div>
      <div class="grid w-[1140px] max-w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="f in features"
          :key="f.title"
          class="flex flex-col gap-3.5 rounded-[18px] border border-[var(--color-line)] bg-white px-[26px] py-7 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.03)]"
        >
          <div class="flex size-fit items-center justify-center rounded-xl bg-brand-500/10 p-[11px]">
            <UIcon :name="f.icon" class="size-[22px] text-brand-500" />
          </div>
          <h3 class="text-lg font-semibold text-ink">{{ f.title }}</h3>
          <p class="text-sm leading-[1.52] text-gray-500">{{ f.body }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="flex w-full flex-col items-center px-6 pb-20 pt-10">
      <div class="relative flex h-[340px] w-[1140px] max-w-full flex-col items-center justify-center gap-[22px] overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0b0b14] to-[#1e1b3a] py-[72px] text-center">
        <div class="pointer-events-none absolute left-1/2 top-1/2 size-[760px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <h2 class="relative px-4 text-[30px] font-extrabold text-white sm:text-[44px]">Stop debugging webhooks blind</h2>
        <p class="relative text-[17px] text-[#a5a3c0]">Spin up Reqtap in one command and see every request the moment it lands.</p>
        <div class="relative flex items-center gap-3 pt-2">
          <UButton to="https://github.com/DreamsHive/reqtap" target="_blank" icon="i-lucide-star" size="lg" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 text-[15px] font-semibold">Star on GitHub</UButton>
          <UButton to="/docs" size="lg" class="rounded-[10px] border border-[#3a3a52] bg-white/[0.07] text-[15px] font-semibold text-white hover:bg-white/10">Read the docs</UButton>
        </div>
      </div>
    </section>
  </div>
</template>
