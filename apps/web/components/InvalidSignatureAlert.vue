<template>
  <div class="flex w-full items-start gap-3 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3.5">
    <UIcon name="i-lucide-shield-alert" class="size-5 shrink-0 text-red-600" />
    <div class="flex flex-1 flex-col gap-0.5">
      <p class="text-sm font-semibold text-red-700">Signature verification failed</p>
      <p class="text-[13px] leading-[1.5] text-red-600">
        The stripe-signature header didn't match your signing secret. This request may not be from Stripe — handle
        with caution.
      </p>
    </div>
  </div>
</template>
