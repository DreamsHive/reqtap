<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
    <AuroraBg />
    <div class="relative flex flex-1 flex-col items-center">
      <MarketingNav />
      <div class="w-full flex-1">
        <slot />
      </div>
      <MarketingFooter />
    </div>
  </div>
</template>
