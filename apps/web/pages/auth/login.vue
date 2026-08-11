<script setup lang="ts">
useHead({ title: 'Sign in · Reqtap' })
const email = ref('')
const password = ref('')
</script>

<template>
  <AuthCard title="Welcome back" subtitle="Sign in to inspect and forward your webhooks.">
    <UButton
      block
      icon="i-lucide-github"
      to="/app"
      class="rounded-[10px] bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90"
    >
      Continue with GitHub
    </UButton>
    <AuthDivider />
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <div class="flex flex-col gap-[7px]">
      <div class="flex items-center justify-between">
        <label class="text-[13px] font-medium text-ink">Password</label>
        <NuxtLink to="/auth/forgot-password" class="text-[12px] font-medium text-brand-500 hover:underline">
          Forgot password?
        </NuxtLink>
      </div>
      <input
        v-model="password"
        type="password"
        placeholder="••••••••••"
        class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
    </div>
    <UButton block to="/app" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
      Sign in
    </UButton>
    <p class="text-[13px] text-gray-500">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-semibold text-brand-500">Sign up</NuxtLink>
    </p>
  </AuthCard>
</template>
