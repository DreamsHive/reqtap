<script setup lang="ts">
useHead({ title: 'Verify email · Reqtap' })
</script>

<template>
  <AuthCard title="Check your inbox">
    <template #default>
      <p class="text-center text-sm text-gray-500">
        We sent a verification link to <span class="font-medium text-ink">you@company.com</span>. Click it to activate your account.
      </p>
      <UButton block class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
        Open email app
      </UButton>
      <p class="text-[13px] text-gray-500">
        Didn't get it?
        <button class="font-semibold text-brand-500">Resend email</button>
      </p>
    </template>
  </AuthCard>
</template>
