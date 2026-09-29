<script setup lang="ts">
useHead({ title: 'Forgot password · Reqtap' })

const email = ref('')
const pending = ref(false)
const error = ref('')
const sent = ref(false)
const devResetToken = ref('')
const resetLink = computed(() => `/auth/reset-password?token=${encodeURIComponent(devResetToken.value)}`)

async function requestReset() {
  pending.value = true
  error.value = ''
  sent.value = false
  devResetToken.value = ''

  try {
    const result = await $fetch<{ ok: boolean; devResetToken?: string }>(apiUrl('/api/auth/password/forgot'), {
      method: 'POST',
      body: { email: email.value },
    })
    sent.value = result.ok
    devResetToken.value = result.devResetToken ?? ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not send reset link'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AuthCard title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <p v-if="sent" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">
      If an account exists, a reset link has been sent.
    </p>
    <NuxtLink
      v-if="devResetToken"
      :to="resetLink"
      class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-700"
    >
      Development reset link
    </NuxtLink>
    <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
    <UButton
      block
      class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold"
      :loading="pending"
      @click="requestReset"
    >
      Send reset link
    </UButton>
    <NuxtLink to="/auth/login" class="flex items-center gap-1.5 text-[13px] font-semibold text-brand-500">
      <UIcon name="i-lucide-arrow-left" class="size-3.5" /> Back to sign in
    </NuxtLink>
  </AuthCard>
</template>
