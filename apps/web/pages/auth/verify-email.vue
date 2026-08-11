<script setup lang="ts">
useHead({ title: 'Verify email · Reqtap' })

const resent = ref(false)
function resend() {
  resent.value = true
  setTimeout(() => (resent.value = false), 3000)
}
</script>

<template>
  <AuthCard title="Check your inbox">
    <template #default>
      <div class="flex items-center justify-center rounded-full bg-brand-500/10 p-4">
        <UIcon name="i-lucide-mail" class="size-8 text-brand-500" />
      </div>
      <p class="text-center text-sm text-gray-500">
        We sent a verification link to <span class="font-medium text-ink">you@company.com</span>. Click it to activate
        your account.
      </p>
      <UButton block to="/onboarding" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-[15px] font-semibold">
        Open email app
      </UButton>
      <p class="text-[13px] text-gray-500">
        Didn't get it?
        <button class="font-semibold text-brand-500 hover:underline" @click="resend">
          {{ resent ? 'Email sent!' : 'Resend email' }}
        </button>
      </p>
    </template>
  </AuthCard>
</template>
