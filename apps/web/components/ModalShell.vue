<script setup lang="ts">
const props = withDefaults(defineProps<{ open?: boolean; width?: number }>(), { width: 480 })
const emit = defineEmits<{ 'update:open': [boolean] }>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      leave-active-class="transition duration-100"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-[1px]"
        @click.self="close"
      >
        <div
          class="overflow-hidden rounded-[18px] bg-white shadow-[0px_24px_60px_-8px_rgba(0,0,0,0.25)]"
          :style="{ width: `${width}px`, maxWidth: '100%' }"
        >
          <slot :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
