<script setup lang="ts">
import type { Endpoint, WebhookProvider } from '@reqtap/shared'
import type { ApiItem, ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Settings · Reqtap' })

const route = useRoute()
const router = useRouter()

const providerOptions: Array<{ label: string; value: '' | WebhookProvider }> = [
  { label: 'No verification', value: '' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'GitHub', value: 'github' },
  { label: 'Shopify', value: 'shopify' },
  { label: 'Clerk', value: 'clerk' },
]

const endpoints = ref<Endpoint[]>([])
const selectedToken = ref('')
const selectedEndpoint = computed(() => endpoints.value.find((endpoint) => endpoint.token === selectedToken.value))
const pending = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const saved = ref('')
const showDelete = ref(false)

const form = reactive({
  name: '',
  responseStatus: '200',
  responseBody: '',
  responseHeaders: '{\n  "content-type": "application/json"\n}',
  provider: '' as '' | WebhookProvider,
  signingSecret: '',
  retentionDays: '30',
  isActive: true,
})

onMounted(loadEndpoints)

watch(selectedToken, (token) => {
  const endpoint = endpoints.value.find((item) => item.token === token)
  if (endpoint) {
    applyEndpoint(endpoint)
  }
})

async function loadEndpoints() {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<ApiList<Endpoint>>('/api/endpoints')
    endpoints.value = result.data
    selectedToken.value =
      (typeof route.query.token === 'string' && endpoints.value.some((endpoint) => endpoint.token === route.query.token)
        ? route.query.token
        : endpoints.value[0]?.token) ?? ''

    const endpoint = endpoints.value.find((item) => item.token === selectedToken.value)
    if (endpoint) {
      applyEndpoint(endpoint)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load endpoint settings'
  } finally {
    pending.value = false
  }
}

function applyEndpoint(endpoint: Endpoint) {
  form.name = endpoint.name
  form.responseStatus = String(endpoint.responseConfig.status)
  form.responseBody = endpoint.responseConfig.body ?? ''
  form.responseHeaders = JSON.stringify(endpoint.responseConfig.headers ?? {}, null, 2)
  form.provider = endpoint.provider ?? ''
  form.signingSecret = ''
  form.retentionDays = String(endpoint.retentionDays)
  form.isActive = endpoint.isActive
}

async function copyUrl() {
  if (selectedToken.value) {
    await navigator.clipboard.writeText(endpointUrl(selectedToken.value))
  }
}

async function saveSettings() {
  if (!selectedToken.value) {
    return
  }

  saving.value = true
  error.value = ''
  saved.value = ''

  try {
    const headers = parseHeaders()
    const payload: Record<string, unknown> = {
      name: form.name,
      provider: form.provider || undefined,
      retentionDays: Number.parseInt(form.retentionDays, 10),
      isActive: form.isActive,
      responseConfig: {
        status: Number.parseInt(form.responseStatus, 10),
        body: form.responseBody,
        headers,
      },
    }

    if (form.signingSecret.trim()) {
      payload.signingSecret = form.signingSecret.trim()
    }

    const result = await authFetch<ApiItem<Endpoint>>(`/api/endpoints/${selectedToken.value}`, {
      method: 'PATCH',
      body: payload,
    })
    upsertEndpoint(result.data)
    applyEndpoint(result.data)
    saved.value = 'Endpoint settings saved'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not save endpoint settings'
  } finally {
    saving.value = false
  }
}

async function deleteEndpoint() {
  if (!selectedToken.value) {
    return
  }

  deleting.value = true
  error.value = ''

  try {
    await authFetch(`/api/endpoints/${selectedToken.value}`, { method: 'DELETE' })
    showDelete.value = false
    endpoints.value = endpoints.value.filter((endpoint) => endpoint.token !== selectedToken.value)
    selectedToken.value = endpoints.value[0]?.token ?? ''

    if (!selectedToken.value) {
      await router.push('/app/endpoints')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not delete endpoint'
  } finally {
    deleting.value = false
  }
}

function parseHeaders() {
  try {
    const value = JSON.parse(form.responseHeaders || '{}') as Record<string, unknown>
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]))
  } catch {
    const error = new Error('Response headers must be valid JSON') as Error & { status?: number }
    error.status = 422
    throw error
  }
}

function upsertEndpoint(endpoint: Endpoint) {
  const index = endpoints.value.findIndex((item) => item.token === endpoint.token)
  if (index >= 0) {
    endpoints.value[index] = endpoint
  } else {
    endpoints.value.unshift(endpoint)
  }
}
</script>

<template>
  <div class="flex flex-col items-center px-5 py-8">
    <div class="flex w-full max-w-[760px] flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-[26px] font-extrabold text-ink">Endpoint settings</h1>
          <p class="mt-1 text-sm text-gray-500">Manage response behavior, verification, retention, and endpoint state.</p>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-copy"
          class="rounded-lg bg-white text-[13px] font-semibold text-ink"
          :disabled="!selectedToken"
          @click="copyUrl"
        >
          Copy URL
        </UButton>
      </div>

      <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
        <SkeletonList :rows="5" />
      </div>

      <div v-else-if="!endpoints.length" class="rounded-[14px] border border-[var(--color-line)] bg-white py-14">
        <EmptyState icon="i-lucide-webhook" title="No endpoints yet" description="Create an endpoint before editing settings.">
          <UButton to="/app/endpoints" icon="i-lucide-plus" class="rounded-[9px] text-sm font-semibold">Go to endpoints</UButton>
        </EmptyState>
      </div>

      <template v-else>
        <div v-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {{ error }}
        </div>
        <div v-if="saved" class="rounded-[14px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {{ saved }}
        </div>

        <SettingsCard title="Endpoint">
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-ink">Endpoint</label>
            <select
              v-model="selectedToken"
              class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option v-for="endpoint in endpoints" :key="endpoint.token" :value="endpoint.token">
                {{ endpoint.name }} · /t/{{ endpoint.token }}
              </option>
            </select>
          </div>
          <FormField v-model="form.name" label="Endpoint name" />
          <div class="flex flex-col gap-[7px]">
            <label class="text-[13px] font-medium text-ink">Endpoint URL</label>
            <div class="flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px]">
              <span class="rt-mono flex-1 truncate text-sm text-gray-600">{{ endpointUrl(selectedToken) }}</span>
            </div>
          </div>
          <ToggleRow
            v-model="form.isActive"
            title="Endpoint active"
            description="Paused endpoints return 404 and stop capturing new requests."
          />
        </SettingsCard>

        <SettingsCard title="Custom response">
          <FormField v-model="form.responseStatus" label="Status code" placeholder="200" />
          <div class="flex flex-col gap-[7px]">
            <label class="text-[13px] font-medium text-ink">Response body</label>
            <textarea
              v-model="form.responseBody"
              rows="5"
              class="rt-mono w-full resize-y rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div class="flex flex-col gap-[7px]">
            <label class="text-[13px] font-medium text-ink">Response headers JSON</label>
            <textarea
              v-model="form.responseHeaders"
              rows="4"
              class="rt-mono w-full resize-y rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </SettingsCard>

        <SettingsCard title="Signature verification">
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-ink">Provider</label>
            <select
              v-model="form.provider"
              class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option v-for="option in providerOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <FormField
            v-model="form.signingSecret"
            label="Signing secret"
            :placeholder="selectedEndpoint?.signingSecretConfigured ? 'Configured — enter a new secret to rotate' : 'Optional'"
          />
        </SettingsCard>

        <SettingsCard title="Retention">
          <FormField v-model="form.retentionDays" label="Keep requests for days" placeholder="30" />
        </SettingsCard>

        <div class="flex justify-end gap-2.5">
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-lg bg-white text-sm font-semibold text-ink"
            @click="loadEndpoints"
          >
            Reset
          </UButton>
          <UButton class="rounded-lg text-sm font-semibold" :loading="saving" @click="saveSettings">
            Save settings
          </UButton>
        </div>

        <div class="flex items-center justify-between rounded-[14px] border border-red-300 bg-red-50 px-[22px] py-[18px]">
          <div class="flex flex-col gap-0.5">
            <p class="text-sm font-semibold text-red-700">Delete this endpoint</p>
            <p class="text-[12px] text-red-600">All captured requests and replay history for this endpoint will be removed.</p>
          </div>
          <UButton color="error" class="rounded-lg text-[13px] font-semibold" @click="() => { showDelete = true }">Delete endpoint</UButton>
        </div>
      </template>
    </div>

    <DeleteEndpointDialog
      v-model:open="showDelete"
      :endpoint-name="selectedEndpoint?.name"
      :request-count="selectedEndpoint?.requestCount ?? 0"
      :pending="deleting"
      @confirm="deleteEndpoint"
    />
  </div>
</template>
