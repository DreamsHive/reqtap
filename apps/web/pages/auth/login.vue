<script setup lang="ts">
useHead({ title: 'Sign in · Reqtap' })
const email = ref('')
const password = ref('')
</script>

<template>
  <AuthCard title="Welcome back" subtitle="Sign in to inspect and forward your webhooks.">
    <UButton block icon="i-lucide-github" class="rounded-[10px] bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90">
      Continue with GitHub
    </UButton>
    <AuthDivider />
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <AuthInput v-model="password" label="Password" type="password" placeholder="••••••••••" />
    <UButton block to="/app" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
      Sign in
    </UButton>
    <p class="text-[13px] text-gray-500">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-semibold text-brand-500">Sign up</NuxtLink>
    </p>
  </AuthCard>
</template>
