<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Settings · Reqtap' })

const name = ref('stripe-prod')
const url = ref('https://reqtap.dev/t/abc123')
const status = ref('200 OK')
const body = ref('{ "received": true }')
const provider = ref('Stripe')
const secret = ref('whsec_••••••••••••••••')
const retention = ref('30 days')
const verify = ref(true)
const autoExpire = ref(false)
</script>

<template>
  <div class="flex flex-col items-center py-8">
    <div class="flex w-[680px] flex-col gap-5">
      <h1 class="text-[26px] font-extrabold text-ink">Settings</h1>

      <SettingsCard title="General">
        <FormField v-model="name" label="Endpoint name" />
        <FormField v-model="url" label="Endpoint URL" />
      </SettingsCard>

      <SettingsCard title="Custom response">
        <FormField v-model="status" label="Status code" select />
        <FormField v-model="body" label="Response body" />
      </SettingsCard>

      <SettingsCard title="Signature verification">
        <FormField v-model="provider" label="Provider" select />
        <FormField v-model="secret" label="Signing secret" />
        <ToggleRow
          v-model="verify"
          title="Verify signatures"
          description="Reject requests that fail verification"
        />
      </SettingsCard>

      <SettingsCard title="Retention">
        <FormField v-model="retention" label="Keep requests for" select />
        <ToggleRow
          v-model="autoExpire"
          title="Auto-expire endpoint"
          description="Delete after 7 days of inactivity"
        />
      </SettingsCard>

      <!-- Danger zone -->
      <div class="flex items-center justify-between rounded-[14px] border border-red-300 bg-red-50 px-[22px] py-[18px]">
        <div class="flex flex-col gap-0.5">
          <p class="text-sm font-semibold text-red-700">Delete this endpoint</p>
          <p class="text-[12px] text-red-600">All captured requests will be permanently removed.</p>
        </div>
        <UButton color="error" class="rounded-lg text-[13px] font-semibold">Delete endpoint</UButton>
      </div>
    </div>
  </div>
</template>
