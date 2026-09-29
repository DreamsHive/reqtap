<script setup lang="ts">
import type { NotificationEvent, NotificationPreferences } from '@reqtap/shared'
import type { ApiItem, ApiList } from '~/composables/useReqtapApi'

type PreferenceKey = Exclude<keyof NotificationPreferences, 'teamId' | 'updatedAt'>

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Notifications · Reqtap' })

const defaultPrefs: NotificationPreferences = {
  teamId: '',
  failedWebhookAlerts: true,
  signatureFailures: true,
  endpointQuiet: false,
  weeklySummary: true,
  productUpdates: false,
  updatedAt: '',
}

const prefs = ref<NotificationPreferences>({ ...defaultPrefs })
const events = ref<NotificationEvent[]>([])
const pending = ref(true)
const saving = ref(false)
const error = ref('')

const alerts: Array<{ key: PreferenceKey; title: string; description: string }> = [
  {
    key: 'failedWebhookAlerts',
    title: 'Failed webhook alerts',
    description: 'Email me when a replay or forward attempt fails.',
  },
  {
    key: 'signatureFailures',
    title: 'Signature failures',
    description: 'Email me when Stripe or GitHub signature verification fails.',
  },
  {
    key: 'endpointQuiet',
    title: 'Endpoint went quiet',
    description: 'Email me when an endpoint stops receiving requests for 24h.',
  },
]

const digests: Array<{ key: PreferenceKey; title: string; description: string }> = [
  {
    key: 'weeklySummary',
    title: 'Weekly summary',
    description: 'A recap of traffic and top endpoints every Monday.',
  },
  {
    key: 'productUpdates',
    title: 'Product updates',
    description: 'Occasional emails about new Reqtap features.',
  },
]

onMounted(loadNotifications)

async function loadNotifications() {
  pending.value = true
  error.value = ''

  try {
    const [preferences, eventList] = await Promise.all([
      authFetch<ApiItem<NotificationPreferences>>('/api/notifications/preferences'),
      authFetch<ApiList<NotificationEvent>>('/api/notifications/events'),
    ])
    prefs.value = preferences.data
    events.value = eventList.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load notification settings'
  } finally {
    pending.value = false
  }
}

async function updatePreference(key: PreferenceKey, value: boolean) {
  prefs.value = { ...prefs.value, [key]: value }
  saving.value = true
  error.value = ''

  try {
    const result = await authFetch<ApiItem<NotificationPreferences>>('/api/notifications/preferences', {
      method: 'PATCH',
      body: { [key]: value },
    })
    prefs.value = result.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not save notification settings'
    await loadNotifications()
  } finally {
    saving.value = false
  }
}

function eventTone(event: NotificationEvent) {
  return event.type === 'signature_failed' || event.type === 'forward_failed' ? 'danger' : 'neutral'
}
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-[26px] font-extrabold text-ink">Notifications</h1>
      <StatusPill v-if="saving" tone="neutral">Saving</StatusPill>
    </div>

    <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
      <SkeletonList :rows="5" />
    </div>

    <div v-else class="flex flex-col gap-[22px]">
      <div v-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
        {{ error }}
      </div>

      <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
        <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
          <h2 class="text-[15px] font-semibold text-ink">Alerts</h2>
        </div>
        <div
          v-for="a in alerts"
          :key="a.key"
          class="border-b border-[var(--color-line)] px-[22px] py-4 last:border-b-0"
        >
          <ToggleRow
            :model-value="prefs[a.key]"
            :title="a.title"
            :description="a.description"
            @update:model-value="updatePreference(a.key, $event)"
          />
        </div>
      </div>

      <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
        <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
          <h2 class="text-[15px] font-semibold text-ink">Digests</h2>
        </div>
        <div
          v-for="d in digests"
          :key="d.key"
          class="border-b border-[var(--color-line)] px-[22px] py-4 last:border-b-0"
        >
          <ToggleRow
            :model-value="prefs[d.key]"
            :title="d.title"
            :description="d.description"
            @update:model-value="updatePreference(d.key, $event)"
          />
        </div>
      </div>

      <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
        <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
          <h2 class="text-[15px] font-semibold text-ink">Recent notification events</h2>
        </div>
        <EmptyState
          v-if="!events.length"
          icon="i-lucide-bell"
          title="No notification events"
          description="Signature failures, replay failures, and team events will appear here."
          class="py-12"
        />
        <template v-else>
          <div
            v-for="event in events"
            :key="event.id"
            class="flex items-start gap-3 border-b border-[var(--color-line)] px-[22px] py-4 last:border-b-0"
          >
            <StatusPill :tone="eventTone(event)">{{ event.type.replace('_', ' ') }}</StatusPill>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-3">
                <p class="truncate text-sm font-semibold text-ink">{{ event.title }}</p>
                <span class="shrink-0 text-[12px] text-gray-500">{{ formatRelativeTime(event.createdAt) }}</span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-gray-500">{{ event.body }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
