<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Requests · Reqtap' })

const filters = ['All', 'POST', 'Failed']
const activeFilter = ref('All')

interface Req {
  method: string
  path: string
  status: number
  meta: string
  time: string
}

const requests: Req[] = [
  { method: 'POST', path: '/webhooks/stripe', status: 200, meta: 'payment_intent.succeeded', time: '2s ago' },
  { method: 'POST', path: '/webhooks/github', status: 200, meta: 'push · main', time: '14s ago' },
  { method: 'POST', path: '/webhooks/shopify', status: 200, meta: 'orders/create', time: '1m ago' },
  { method: 'GET', path: '/webhooks/health', status: 200, meta: '—', time: '3m ago' },
  { method: 'POST', path: '/webhooks/stripe', status: 400, meta: 'invalid signature', time: '5m ago' },
  { method: 'POST', path: '/webhooks/clerk', status: 200, meta: 'user.created', time: '8m ago' },
  { method: 'POST', path: '/webhooks/stripe', status: 200, meta: 'charge.refunded', time: '12m ago' },
]

const selected = ref(0)
const router = useRouter()

// On mobile the detail panel is hidden, so tapping a row opens the detail route.
function selectRequest(i: number) {
  selected.value = i
  if (import.meta.client && window.matchMedia('(max-width: 767px)').matches) {
    router.push('/app/request')
  }
}

const tabs = ['Body', 'Headers', 'Query', 'Response']
const activeTab = ref('Body')

const bodyLines = [
  { t: '{', c: 'text-[#8b949e]' },
  { t: '  "id": "evt_1P9x2eKz…",', c: 'text-[#e7e7ec]' },
  { t: '  "object": "event",', c: 'text-[#e7e7ec]' },
  { t: '  "type": "payment_intent.succeeded",', c: 'text-[#a78bfa]' },
  { t: '  "created": 1719402312,', c: 'text-[#79c0ff]' },
  { t: '  "data": {', c: 'text-[#e7e7ec]' },
  { t: '    "object": {', c: 'text-[#e7e7ec]' },
  { t: '      "id": "pi_3P9x…",', c: 'text-[#e7e7ec]' },
  { t: '      "amount": 4200,', c: 'text-[#7ee787]' },
  { t: '      "currency": "usd",', c: 'text-[#7ee787]' },
  { t: '      "status": "succeeded"', c: 'text-[#7ee787]' },
  { t: '    }', c: 'text-[#e7e7ec]' },
  { t: '  },', c: 'text-[#e7e7ec]' },
  { t: '  "livemode": false', c: 'text-[#e7e7ec]' },
  { t: '}', c: 'text-[#8b949e]' },
]

const headers = [
  { key: 'content-type', value: 'application/json; charset=utf-8' },
  { key: 'stripe-signature', value: 't=1719402312,v1=5a2b3c…' },
  { key: 'user-agent', value: 'Stripe/1.0 (+https://stripe.com)' },
  { key: 'content-length', value: '1204' },
  { key: 'x-forwarded-for', value: '94.23.11.8' },
  { key: 'idempotency-key', value: 'evt_1P9x2eKz' },
]

const responseLines = [
  { t: '{', c: 'text-[#8b949e]' },
  { t: '  "received": true', c: 'text-[#7ee787]' },
  { t: '}', c: 'text-[#8b949e]' },
]
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Sub-header: endpoint switcher + copy url -->
    <div class="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-2.5">
      <EndpointSwitcher />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-copy"
        class="rounded-lg bg-subtle text-[13px] font-medium text-ink"
      >Copy URL</UButton>
    </div>

    <div class="flex min-h-0 flex-1">
      <!-- Request list column -->
      <div class="flex w-full shrink-0 flex-col border-r border-[var(--color-line)] bg-white md:w-[400px]">
        <div class="flex flex-col gap-3 border-b border-[var(--color-line)] px-4 pb-3.5 pt-4">
          <div class="flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] bg-subtle px-3 py-2">
            <UIcon name="i-lucide-search" class="size-4 text-gray-400" />
            <input
              placeholder="Search requests…"
              class="w-full bg-transparent text-sm text-ink placeholder:text-gray-400 focus:outline-none"
            >
          </div>
          <div class="flex gap-2">
            <button
              v-for="f in filters"
              :key="f"
              class="rounded-full px-[11px] py-[5px] text-[12px] font-medium transition-colors"
              :class="
                activeFilter === f
                  ? 'bg-brand-500 text-white'
                  : 'border border-[var(--color-line)] bg-subtle text-gray-500'
              "
              @click="activeFilter = f"
            >
              {{ f }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
          <button
            v-for="(r, i) in requests"
            :key="i"
            class="flex w-full flex-col gap-1.5 border-b border-[var(--color-line)] px-4 py-3 text-left transition-colors"
            :class="selected === i ? 'border-l-2 border-l-brand-500 bg-brand-500/[0.06]' : 'hover:bg-gray-50'"
            @click="selectRequest(i)"
          >
            <div class="flex items-center gap-2">
              <MethodBadge :method="r.method" class="!px-1.5 !py-0.5 !text-[11px]" />
              <span class="flex-1 truncate text-[13px] font-medium text-ink">{{ r.path }}</span>
              <span
                class="text-[12px] font-semibold"
                :class="r.status < 400 ? 'text-green-600' : 'text-red-500'"
              >{{ r.status }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[12px] text-gray-500">{{ r.meta }}</span>
              <span class="text-[11px] text-gray-400">{{ r.time }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Detail panel -->
      <div class="hidden flex-1 flex-col gap-5 overflow-y-auto bg-white px-7 pb-6 pt-[22px] md:flex">
        <div class="flex items-center gap-3">
          <MethodBadge method="POST" class="!px-2.5 !py-1 !text-[13px]" />
          <span class="flex-1 text-lg font-semibold text-ink">/webhooks/stripe</span>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-rotate-ccw"
            class="rounded-lg bg-subtle text-[13px] font-medium text-ink"
          >Replay</UButton>
          <UButton
            icon="i-lucide-arrow-right"
            class="rounded-lg text-[13px] font-semibold"
          >Forward to localhost</UButton>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="200" dot>Stripe signature verified</StatusBadge>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">200 OK · 42ms</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">94.23.11.8</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">1.2 KB</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">application/json</span>
        </div>

        <div class="flex gap-6 border-b border-[var(--color-line)]">
          <button
            v-for="t in tabs"
            :key="t"
            class="pb-2.5 text-sm font-medium transition-colors"
            :class="activeTab === t ? 'border-b-2 border-brand-500 font-semibold text-ink' : 'text-gray-500'"
            @click="activeTab = t"
          >{{ t }}</button>
        </div>

        <!-- Body -->
        <div v-if="activeTab === 'Body'" class="rt-mono flex flex-1 flex-col gap-[3px] rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.72]">
          <p v-for="(l, i) in bodyLines" :key="i" :class="l.c" class="whitespace-pre">{{ l.t }}</p>
        </div>

        <!-- Headers -->
        <div v-else-if="activeTab === 'Headers'" class="overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-subtle">
          <div
            v-for="(h, i) in headers"
            :key="h.key"
            class="flex items-center border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
            :class="i % 2 ? 'bg-white' : ''"
          >
            <span class="rt-mono w-[220px] shrink-0 font-semibold text-ink">{{ h.key }}</span>
            <span class="rt-mono flex-1 text-gray-500">{{ h.value }}</span>
          </div>
        </div>

        <!-- Query -->
        <div v-else-if="activeTab === 'Query'" class="flex flex-1 items-center justify-center rounded-[10px] border border-[var(--color-line)] bg-subtle py-16">
          <EmptyState icon="i-lucide-list" title="No query parameters" description="This request was sent without a query string." />
        </div>

        <!-- Response -->
        <div v-else class="rt-mono flex flex-1 flex-col gap-[3px] rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.72]">
          <p v-for="(l, i) in responseLines" :key="i" :class="l.c" class="whitespace-pre">{{ l.t }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
