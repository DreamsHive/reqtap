<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'States & overlays · Reqtap' })

const showNewEndpoint = ref(false)
const showConnectCli = ref(false)
const showDelete = ref(false)
const showApiKey = ref(false)
const showInvite = ref(false)

const sigBody = [
  { t: '{', c: 'text-[#8b949e]' },
  { t: '  "id": "evt_forged_001",', c: 'text-[#e7e7ec]' },
  { t: '  "type": "payment_intent.succeeded",', c: 'text-[#a78bfa]' },
  { t: '  "amount": 999999', c: 'text-[#7ee787]' },
  { t: '}', c: 'text-[#8b949e]' },
]
</script>

<template>
  <div class="flex flex-col gap-6 px-8 py-7">
    <PageHeader title="States & overlays" subtitle="Modals, dialogs, and edge-case states from the design system." />

    <!-- Modal triggers -->
    <div class="flex flex-wrap gap-2.5">
      <UButton variant="outline" color="neutral" class="rounded-lg bg-white text-ink" @click="showNewEndpoint = true">New endpoint</UButton>
      <UButton variant="outline" color="neutral" class="rounded-lg bg-white text-ink" @click="showConnectCli = true">Connect CLI</UButton>
      <UButton variant="outline" color="neutral" class="rounded-lg bg-white text-ink" @click="showApiKey = true">Create API key</UButton>
      <UButton variant="outline" color="neutral" class="rounded-lg bg-white text-ink" @click="showInvite = true">Invite member</UButton>
      <UButton variant="outline" color="error" class="rounded-lg bg-white" @click="showDelete = true">Delete dialog</UButton>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Invalid signature -->
      <div class="col-span-2 flex flex-col gap-4 rounded-[14px] border border-[var(--color-line)] bg-white px-7 py-6">
        <p class="text-[13px] font-semibold tracking-wide text-gray-400">INVALID SIGNATURE</p>
        <div class="flex items-center gap-3">
          <MethodBadge method="POST" />
          <span class="flex-1 text-lg font-semibold text-ink">/webhooks/stripe</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="400" dot>Signature invalid</StatusBadge>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">400 · 8ms</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">94.23.11.8</span>
          <span class="rounded-full border border-[var(--color-line)] bg-subtle px-2.5 py-1 text-[12px] font-medium text-gray-500">1.2 KB</span>
        </div>
        <InvalidSignatureAlert />
        <div class="rt-mono flex flex-col gap-[3px] rounded-[10px] bg-[#0c0c12] px-[18px] py-4 text-[13px] leading-[1.72]">
          <p v-for="(l, i) in sigBody" :key="i" :class="l.c" class="whitespace-pre">{{ l.t }}</p>
        </div>
      </div>

      <!-- Empty search -->
      <div class="flex h-[340px] flex-col overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
        <p class="border-b border-[var(--color-line)] px-4 py-3 text-[13px] font-semibold tracking-wide text-gray-400">EMPTY SEARCH</p>
        <div class="flex flex-1 items-center justify-center">
          <EmptyState icon="i-lucide-search-x" title="No requests match" description="Try a different search term or clear your filters.">
            <template #action>
              <UButton variant="outline" color="neutral" class="rounded-lg bg-white text-[13px] font-semibold text-ink">Clear filters</UButton>
            </template>
          </EmptyState>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div class="flex h-[340px] flex-col overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
        <p class="border-b border-[var(--color-line)] px-4 py-3 text-[13px] font-semibold tracking-wide text-gray-400">SKELETON LOADING</p>
        <SkeletonList :rows="5" />
      </div>
    </div>

    <NewEndpointModal v-model:open="showNewEndpoint" />
    <ConnectCliModal v-model:open="showConnectCli" />
    <CreateApiKeyModal v-model:open="showApiKey" />
    <InviteMemberModal v-model:open="showInvite" />
    <DeleteEndpointDialog v-model:open="showDelete" />
  </div>
</template>
