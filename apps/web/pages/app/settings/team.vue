<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Team · Reqtap' })

const members = [
  { name: 'Rafli Al Farizqi', email: 'codewithrafli@gmail.com', role: 'Owner', img: 13, pending: false },
  { name: 'Sarah Chen', email: 'sarah@team.io', role: 'Admin', img: 47, pending: false },
  { name: 'Dimas Prakoso', email: 'dimas@team.io', role: 'Member', img: 33, pending: false },
  { name: 'jane@contractor.dev', email: 'Invitation pending', role: 'Member', img: 5, pending: true },
]
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Team members" subtitle="Invite people to collaborate on your endpoints.">
      <template #actions>
        <UButton icon="i-lucide-user-plus" class="rounded-[9px] text-sm font-semibold">Invite member</UButton>
      </template>
    </PageHeader>

    <div class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div
        v-for="m in members"
        :key="m.email"
        class="flex items-center gap-3.5 border-b border-[var(--color-line)] px-5 py-3.5 last:border-b-0"
      >
        <UAvatar :src="`https://i.pravatar.cc/72?img=${m.img}`" size="lg" />
        <div class="flex flex-1 flex-col gap-0.5">
          <p class="text-sm font-semibold text-ink">{{ m.name }}</p>
          <p class="text-[12px]" :class="m.pending ? 'text-amber-600' : 'text-gray-500'">{{ m.email }}</p>
        </div>
        <button class="flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-subtle py-1.5 pl-2.5 pr-2 text-[13px] font-medium text-gray-600">
          {{ m.role }}
          <UIcon name="i-lucide-chevron-down" class="size-3 text-gray-400" />
        </button>
      </div>
    </div>
  </div>
</template>
