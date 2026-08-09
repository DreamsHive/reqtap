<script setup lang="ts">
useHead({ title: 'Reset password · Reqtap' })
const password = ref('')
const confirm = ref('')
</script>

<template>
  <AuthCard title="Set a new password" subtitle="Choose a strong password you haven't used before.">
    <AuthInput v-model="password" label="New password" type="password" placeholder="At least 8 characters" />
    <AuthInput v-model="confirm" label="Confirm password" type="password" placeholder="Re-enter password" />
    <UButton block to="/auth/login" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
      Update password
    </UButton>
    <NuxtLink to="/auth/login" class="flex items-center gap-1.5 text-[13px] font-semibold text-brand-500">
      <UIcon name="i-lucide-arrow-left" class="size-3.5" /> Back to sign in
    </NuxtLink>
  </AuthCard>
</template>
