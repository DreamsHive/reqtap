<script setup lang="ts">
useHead({ title: 'Reset password · Reqtap' })

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirm = ref('')
const pending = ref(false)
const error = ref('')
const done = ref(false)
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

async function resetPassword() {
  error.value = ''

  if (!token.value) {
    error.value = 'Reset token is missing'
    return
  }

  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  pending.value = true

  try {
    await $fetch(apiUrl('/api/auth/password/reset'), {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    done.value = true
    window.setTimeout(() => router.push('/auth/login'), 900)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not reset password'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AuthCard title="Set a new password" subtitle="Choose a strong password you haven't used before.">
    <p v-if="!token" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-700">
      Open this page from the reset link in your email.
    </p>
    <AuthInput v-model="password" label="New password" type="password" placeholder="At least 8 characters" />
    <AuthInput v-model="confirm" label="Confirm password" type="password" placeholder="Re-enter password" />
    <p v-if="done" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">
      Password updated. Redirecting to sign in...
    </p>
    <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
    <UButton
      block
      class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold"
      :disabled="!token"
      :loading="pending"
      @click="resetPassword"
    >
      Update password
    </UButton>
    <NuxtLink to="/auth/login" class="flex items-center gap-1.5 text-[13px] font-semibold text-brand-500">
      <UIcon name="i-lucide-arrow-left" class="size-3.5" /> Back to sign in
    </NuxtLink>
  </AuthCard>
</template>
