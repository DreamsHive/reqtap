<script setup lang="ts">
import type { TeamMember, TeamRole } from '@reqtap/shared'
import type { ApiList } from '~/composables/useReqtapApi'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Team · Reqtap' })

const members = ref<TeamMember[]>([])
const pending = ref(true)
const error = ref('')
const showInvite = ref(false)
const roleOptions: TeamRole[] = ['Owner', 'Admin', 'Member']

onMounted(loadMembers)

async function loadMembers() {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<ApiList<TeamMember>>('/api/team/members')
    members.value = result.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load team members'
  } finally {
    pending.value = false
  }
}

async function updateRole(member: TeamMember, role: TeamRole) {
  if (member.pending || member.role === role) {
    return
  }

  await authFetch(`/api/team/members/${member.id}`, {
    method: 'PATCH',
    body: { role },
  })
  member.role = role
}

function memberSubtitle(member: TeamMember) {
  return member.pending ? 'Invitation pending' : member.email
}
</script>

<template>
  <div class="flex flex-col gap-[22px] px-8 py-7">
    <PageHeader title="Team members" subtitle="Invite people to collaborate on your endpoints.">
      <template #actions>
        <UButton icon="i-lucide-user-plus" class="rounded-[9px] text-sm font-semibold" @click="() => { showInvite = true }">Invite member</UButton>
      </template>
    </PageHeader>

    <div v-if="pending" class="rounded-[14px] border border-[var(--color-line)] bg-white p-5">
      <SkeletonList :rows="4" />
    </div>

    <div v-else-if="error" class="rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {{ error }}
    </div>

    <div v-else-if="!members.length" class="rounded-[14px] border border-[var(--color-line)] bg-white py-14">
      <EmptyState icon="i-lucide-users" title="No members yet" description="Invite a teammate to start collaborating." />
    </div>

    <div v-else class="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
      <div
        v-for="m in members"
        :key="m.id"
        class="flex items-center gap-3.5 border-b border-[var(--color-line)] px-5 py-3.5 last:border-b-0"
      >
        <UAvatar :alt="m.name" size="lg" />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-semibold text-ink">{{ m.name }}</p>
            <StatusPill v-if="m.pending" tone="warning">Pending</StatusPill>
          </div>
          <p class="truncate text-[12px]" :class="m.pending ? 'text-amber-600' : 'text-gray-500'">{{ memberSubtitle(m) }}</p>
        </div>
        <select
          class="rounded-lg border border-[var(--color-line)] bg-subtle px-2.5 py-1.5 text-[13px] font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
          :value="m.role"
          :disabled="m.pending"
          @change="updateRole(m, ($event.target as HTMLSelectElement).value as TeamRole)"
        >
          <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
    </div>

    <InviteMemberModal v-model:open="showInvite" @invited="loadMembers" />
  </div>
</template>
