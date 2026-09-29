<script setup lang="ts">
useHead({ title: 'Create account · Reqtap' })
const route = useRoute()
const name = ref('')
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const pending = ref(false)
const error = ref('')
const router = useRouter()
const inviteId = computed(() => (typeof route.query.invite === 'string' ? route.query.invite : undefined))

async function register() {
  pending.value = true
  error.value = ''

  try {
    const result = await $fetch<{ data: unknown; token: string }>(apiUrl('/api/auth/register'), {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value, inviteId: inviteId.value },
    })
    setAuthToken(result.token)
    await router.push('/app')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not create account'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AuthCard
    :title="inviteId ? 'Accept your invite' : 'Create your account'"
    :subtitle="inviteId ? 'Create an account to join this Reqtap workspace.' : 'Start capturing webhooks in seconds — free forever.'"
  >
    <UButton
      block
      icon="i-lucide-github"
      disabled
      class="rounded-[10px] bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90"
    >
      GitHub OAuth coming soon
    </UButton>
    <AuthDivider />
    <AuthInput v-model="name" label="Full name" placeholder="Jane Cooper" />
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <AuthInput v-model="password" label="Password" type="password" placeholder="At least 8 characters" />
    <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
    <UButton
      block
      class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold"
      :loading="pending"
      @click="register"
    >
      Create account
    </UButton>
    <p class="text-[13px] text-gray-500">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-semibold text-brand-500">Sign in</NuxtLink>
    </p>
  </AuthCard>
</template>
