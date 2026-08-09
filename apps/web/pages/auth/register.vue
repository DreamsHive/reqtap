<script setup lang="ts">
useHead({ title: 'Create account · Reqtap' })
const name = ref('')
const email = ref('')
const password = ref('')
</script>

<template>
  <AuthCard title="Create your account" subtitle="Start capturing webhooks in seconds — free forever.">
    <UButton block icon="i-lucide-github" class="rounded-[10px] bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90">
      Sign up with GitHub
    </UButton>
    <AuthDivider />
    <AuthInput v-model="name" label="Full name" placeholder="Jane Cooper" />
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <AuthInput v-model="password" label="Password" type="password" placeholder="At least 8 characters" />
    <UButton block to="/onboarding" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
      Create account
    </UButton>
    <p class="text-[13px] text-gray-500">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-semibold text-brand-500">Sign in</NuxtLink>
    </p>
  </AuthCard>
</template>
