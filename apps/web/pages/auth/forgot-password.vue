<script setup lang="ts">
useHead({ title: 'Forgot password · Reqtap' })
const email = ref('')
</script>

<template>
  <AuthCard title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
    <AuthInput v-model="email" label="Email" type="email" placeholder="you@company.com" />
    <UButton block class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
      Send reset link
    </UButton>
    <NuxtLink to="/auth/login" class="flex items-center gap-1.5 text-[13px] font-semibold text-brand-500">
      <UIcon name="i-lucide-arrow-left" class="size-3.5" /> Back to sign in
    </NuxtLink>
  </AuthCard>
</template>
