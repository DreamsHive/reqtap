<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
useHead({ title: 'Page not found · Reqtap' })
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-4 text-center">
    <AuroraBg />
    <div class="relative flex flex-col items-center gap-[18px]">
      <p class="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-[120px] font-extrabold leading-none text-transparent">
        {{ error?.statusCode ?? 404 }}
      </p>
      <h1 class="text-[28px] font-extrabold text-ink">This webhook flew away</h1>
      <p class="text-base text-gray-500">The page or endpoint you're looking for doesn't exist or was removed.</p>
      <div class="flex items-center gap-3 pt-2.5">
        <UButton to="/app" size="lg" class="rounded-[10px] bg-gradient-to-r from-brand-500 to-violet-500 text-[15px] font-semibold" @click="clearError({ redirect: '/app' })">
          Back to dashboard
        </UButton>
        <UButton to="/docs" color="neutral" variant="outline" size="lg" class="rounded-[10px] bg-white text-[15px] font-semibold text-ink">
          Read the docs
        </UButton>
      </div>
    </div>
  </div>
</template>
