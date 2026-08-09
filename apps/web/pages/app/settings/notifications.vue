<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Notifications · Reqtap' })

const alerts = reactive([
  { title: 'Failed webhook alerts', description: 'Notify me when a forwarded request returns 4xx/5xx', on: true },
  { title: 'Signature failures', description: 'Alert on requests that fail signature verification', on: true },
  { title: 'Endpoint went quiet', description: 'When an endpoint stops receiving requests for 24h', on: false },
])
const digests = reactive([
  { title: 'Weekly summary', description: 'A recap of traffic and top endpoints every Monday', on: true },
  { title: 'Product updates', description: 'Occasional emails about new features', on: false },
])
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <h1 class="text-[26px] font-extrabold text-ink">Notifications</h1>

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
        <h2 class="text-[15px] font-semibold text-ink">Alerts</h2>
      </div>
      <div
        v-for="(a, i) in alerts"
        :key="a.title"
        class="border-b border-[var(--color-line)] px-[22px] py-4 last:border-b-0"
      >
        <ToggleRow v-model="a.on" :title="a.title" :description="a.description" />
      </div>
    </div>

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div class="border-b border-[var(--color-line)] bg-subtle px-[22px] py-4">
        <h2 class="text-[15px] font-semibold text-ink">Digests</h2>
      </div>
      <div
        v-for="(d, i) in digests"
        :key="d.title"
        class="border-b border-[var(--color-line)] px-[22px] py-4 last:border-b-0"
      >
        <ToggleRow v-model="d.on" :title="d.title" :description="d.description" />
      </div>
    </div>
  </div>
</template>
