<script setup lang="ts">
import type { Endpoint, WebhookRequest } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Requests · Reqtap' })

const filters = ['All', 'POST', 'GET', 'Failed']
const activeFilter = ref('All')
const search = ref('')
const selectedId = ref('')
const activeTab = ref('Body')
const showForward = ref(false)
const showReplay = ref(false)
const connectionState = ref<'idle' | 'connected' | 'error'>('idle')

const endpoints = ref<Endpoint[]>([])
const selectedToken = ref('')
const endpoint = computed(() => endpoints.value.find((item) => item.token === selectedToken.value))
const requests = ref<WebhookRequest[]>([])
const selectedRequest = computed(
  () => requests.value.find((request) => request.id === selectedId.value) ?? requests.value[0]
)

onMounted(refreshEndpoints)

watchEffect(() => {
  if (!selectedToken.value && endpoints.value[0]) {
    selectedToken.value = endpoints.value[0].token
  }
})

watch(
  [selectedToken, activeFilter, search],
  async () => {
    await loadRequests()
  },
  { immediate: true }
)

if (import.meta.client) {
  watch(
    selectedToken,
    (token, _oldToken, onCleanup) => {
      if (!token) {
        return
      }

      const streamQuery = new URLSearchParams()
      const authToken = getAuthToken()
      if (authToken) {
        streamQuery.set('auth', authToken)
      }
      const source = new EventSource(apiUrl(`/api/events/${token}${streamQuery.size ? `?${streamQuery}` : ''}`))
      connectionState.value = 'idle'

      source.addEventListener('ready', () => {
        connectionState.value = 'connected'
      })

      source.addEventListener('request.new', (event) => {
        const request = JSON.parse((event as MessageEvent).data) as WebhookRequest
        requests.value = [request, ...requests.value.filter((item) => item.id !== request.id)]

        if (!selectedId.value) {
          selectedId.value = request.id
        }
      })

      source.onerror = () => {
        connectionState.value = 'error'
      }

      onCleanup(() => source.close())
    },
    { immediate: true }
  )
}

async function loadRequests() {
  if (!selectedToken.value) {
    requests.value = []
    return
  }

  const query = new URLSearchParams({ token: selectedToken.value, limit: '100' })

  if (activeFilter.value === 'Failed') {
    query.set('status', 'failed')
  } else if (activeFilter.value !== 'All') {
    query.set('method', activeFilter.value)
  }

  if (search.value.trim()) {
    query.set('q', search.value.trim())
  }

  const result = await authFetch<ApiList<WebhookRequest>>(`/api/requests?${query}`)
  requests.value = result.data

  if (!requests.value.some((request) => request.id === selectedId.value)) {
    selectedId.value = requests.value[0]?.id ?? ''
  }
}

async function refreshEndpoints() {
  const result = await authFetch<ApiList<Endpoint>>('/api/endpoints')
  endpoints.value = result.data
}

function selectRequest(request: WebhookRequest) {
  selectedId.value = request.id
}

async function copySelectedUrl() {
  if (selectedToken.value) {
    await navigator.clipboard.writeText(endpointUrl(selectedToken.value))
  }
}

function selectEndpoint(token: string) {
  selectedToken.value = token
  selectedId.value = ''
}

const bodyText = computed(() => prettyBody(selectedRequest.value))
const bodyLines = computed(() => bodyText.value.split('\n'))
const headerEntries = computed(() => Object.entries(selectedRequest.value?.headers ?? {}))
const queryEntries = computed(() => Object.entries(selectedRequest.value?.query ?? {}))
const responseBody = computed(() => endpoint.value?.responseConfig.body ?? '')
const responseLines = computed(() => responseBody.value.split('\n'))
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-white px-4 py-2.5">
      <div class="flex items-center gap-2">
        <select
          class="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-[13px] font-medium text-ink focus:outline-none"
          :value="selectedToken"
          @change="selectEndpoint(($event.target as HTMLSelectElement).value)"
        >
          <option v-if="!endpoints.length" value="">No endpoints</option>
          <option v-for="e in endpoints" :key="e.token" :value="e.token">{{ e.name }}</option>
        </select>
        <StatusPill :tone="connectionState === 'connected' ? 'success' : connectionState === 'error' ? 'danger' : 'neutral'">
          {{ connectionState === 'connected' ? 'Live' : connectionState === 'error' ? 'Disconnected' : 'Connecting' }}
        </StatusPill>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-copy"
        class="rounded-lg bg-subtle text-[13px] font-medium text-ink"
        :disabled="!selectedToken"
        @click="copySelectedUrl"
      >Copy URL</UButton>
    </div>

    <div v-if="!endpoints.length" class="flex flex-1 items-center justify-center bg-white">
      <EmptyState icon="i-lucide-webhook" title="No endpoint yet" description="Create an endpoint before capturing webhooks.">
        <UButton icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold" @click="() => refreshEndpoints()">Refresh</UButton>
      </EmptyState>
    </div>

    <div v-else class="flex min-h-0 flex-1">
      <div class="flex w-full shrink-0 flex-col border-r border-[var(--color-line)] bg-white md:w-[400px]">
        <div class="flex flex-col gap-3 border-b border-[var(--color-line)] px-4 pb-3.5 pt-4">
          <div class="flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] bg-subtle px-3 py-2">
            <UIcon name="i-lucide-search" class="size-4 text-gray-400" />
            <input
              v-model="search"
              placeholder="Search requests..."
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
              @click="() => { activeFilter = f }"
            >
              {{ f }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
          <EmptyState
            v-if="!requests.length"
            icon="i-lucide-inbox"
            title="Waiting for requests"
            :description="`Send a webhook to ${endpointUrl(selectedToken)}`"
            class="py-16"
          />
          <button
            v-for="r in requests"
            :key="r.id"
            class="flex w-full flex-col gap-1.5 border-b border-[var(--color-line)] px-4 py-3 text-left transition-colors"
            :class="selectedRequest?.id === r.id ? 'border-l-2 border-l-brand-500 bg-brand-500/[0.06]' : 'hover:bg-gray-50'"
            @click="selectRequest(r)"
          >
            <div class="flex items-center gap-2">
              <MethodBadge :method="r.method" class="!px-1.5 !py-0.5 !text-[11px]" />
              <span class="flex-1 truncate text-[13px] font-medium text-ink">{{ r.path }}</span>
              <span
                class="text-[12px] font-semibold"
                :class="r.responseStatus < 400 ? 'text-green-600' : 'text-red-500'"
              >{{ r.responseStatus }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="truncate text-[12px] text-gray-500">{{ r.provider ?? r.contentType ?? 'unknown' }}</span>
              <span class="shrink-0 text-[11px] text-gray-400">{{ formatRelativeTime(r.createdAt) }}</span>
            </div>
          </button>
        </div>
      </div>

      <div v-if="selectedRequest" class="hidden flex-1 flex-col gap-5 overflow-y-auto bg-white px-7 pb-6 pt-[22px] md:flex">
        <div class="flex items-center gap-3">
          <MethodBadge :method="selectedRequest.method" class="!px-2.5 !py-1 !text-[13px]" />
          <span class="flex-1 text-lg font-semibold text-ink">{{ selectedRequest.path }}</span>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-rotate-ccw"
            class="rounded-lg bg-subtle text-[13px] font-medium text-ink"
            @click="() => { showReplay = true }"
          >Replay</UButton>
          <UButton
            icon="i-lucide-arrow-right"
            class="rounded-lg text-[13px] font-semibold"
            @click="() => { showForward = true }"
          >Forward to localhost</UButton>
        </div>

        <InvalidSignatureAlert v-if="selectedRequest.signatureStatus === 'invalid'" />

        <div class="flex flex-wrap items-center gap-2">
          <StatusPill :tone="signatureTone(selectedRequest.signatureStatus)">
            {{ signatureText(selectedRequest.signatureStatus) }}
          </StatusPill>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">
            {{ selectedRequest.responseStatus }} · {{ selectedRequest.latencyMs }}ms
          </span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">{{ selectedRequest.ip }}</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">{{ formatBytes(selectedRequest.bodySize) }}</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">{{ selectedRequest.contentType || 'unknown' }}</span>
        </div>

        <div class="flex gap-6 border-b border-[var(--color-line)]">
          <button
            v-for="t in ['Body', 'Headers', 'Query', 'Response']"
            :key="t"
            class="pb-2.5 text-sm font-medium transition-colors"
            :class="activeTab === t ? 'border-b-2 border-brand-500 font-semibold text-ink' : 'text-gray-500'"
            @click="() => { activeTab = t }"
          >{{ t }}</button>
        </div>

        <div v-if="activeTab === 'Body'" class="rt-mono flex flex-1 flex-col gap-[3px] overflow-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.72]">
          <p v-for="(line, i) in bodyLines" :key="i" class="whitespace-pre text-[#e7e7ec]">{{ line }}</p>
        </div>

        <div v-else-if="activeTab === 'Headers'" class="overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-subtle">
          <div
            v-for="([key, value], i) in headerEntries"
            :key="key"
            class="flex items-start border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
            :class="i % 2 ? 'bg-white' : ''"
          >
            <span class="rt-mono w-[220px] shrink-0 font-semibold text-ink">{{ key }}</span>
            <span class="rt-mono flex-1 break-all text-gray-500">{{ value }}</span>
          </div>
        </div>

        <div v-else-if="activeTab === 'Query'" class="overflow-hidden rounded-[10px] border border-[var(--color-line)] bg-subtle">
          <EmptyState v-if="!queryEntries.length" icon="i-lucide-list" title="No query parameters" description="This request was sent without a query string." class="py-16" />
          <template v-else>
            <div
              v-for="([key, value], i) in queryEntries"
              :key="key"
              class="flex items-start border-b border-[var(--color-line)] px-4 py-3 text-[13px] last:border-b-0"
              :class="i % 2 ? 'bg-white' : ''"
            >
              <span class="rt-mono w-[220px] shrink-0 font-semibold text-ink">{{ key }}</span>
              <span class="rt-mono flex-1 break-all text-gray-500">{{ value }}</span>
            </div>
          </template>
        </div>

        <div v-else class="rt-mono flex flex-1 flex-col gap-[3px] overflow-auto rounded-xl bg-[#0c0c12] px-5 py-[18px] text-[13px] leading-[1.72]">
          <p v-for="(line, i) in responseLines" :key="i" class="whitespace-pre text-[#e7e7ec]">{{ line }}</p>
        </div>
      </div>
    </div>

    <ConnectCliModal v-model:open="showForward" :token="selectedToken" />
    <ReplayModal v-model:open="showReplay" :request-id="selectedRequest?.id" @replayed="loadRequests" />
  </div>
</template>
