<script setup lang="ts">
import type { TeamInvite, TeamRole } from '@reqtap/shared'

defineProps<{ open?: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; invited: [TeamInvite] }>()
const email = ref('')
const role = ref<TeamRole>('Member')
const message = ref('')
const pending = ref(false)
const error = ref('')
const roleOptions: TeamRole[] = ['Admin', 'Member']

async function invite(close: () => void) {
  pending.value = true
  error.value = ''

  try {
    const result = await authFetch<{ data: TeamInvite }>('/api/team/invites', {
      method: 'POST',
      body: { email: email.value, role: role.value, message: message.value },
    })
    emit('invited', result.data)
    email.value = ''
    role.value = 'Member'
    message.value = ''
    close()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not send invite'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <ModalShell :open="open" :width="460" @update:open="$emit('update:open', $event)">
    <template #default="{ close }">
      <div class="flex items-center justify-between border-b border-[var(--color-line)] py-5 pl-6 pr-5">
        <h2 class="text-[17px] font-semibold text-ink">Invite a member</h2>
        <button class="text-gray-400 hover:text-ink" @click="close"><UIcon name="i-lucide-x" class="size-5" /></button>
      </div>
      <div class="flex flex-col gap-[18px] px-6 py-[22px]">
        <FormField v-model="email" label="Email address" placeholder="teammate@company.com" />
        <div class="flex w-full flex-col gap-2">
          <label class="text-[13px] font-medium text-ink">Role</label>
          <select
            v-model="role"
            class="w-full rounded-[9px] border border-[var(--color-line)] bg-subtle px-[13px] py-[11px] text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option v-for="option in roleOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <FormField v-model="message" label="Message (optional)" placeholder="Join our Reqtap workspace" />
        <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2.5 border-t border-[var(--color-line)] bg-subtle px-6 py-4">
        <UButton color="neutral" variant="outline" class="rounded-lg bg-white text-sm font-semibold text-ink" @click="close">Cancel</UButton>
        <UButton class="rounded-lg text-sm font-semibold" :loading="pending" @click="invite(close)">Send invite</UButton>
      </div>
    </template>
  </ModalShell>
</template>
