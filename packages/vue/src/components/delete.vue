<template>
  <div v-if="context.isUpdateMode && !context.isReading" class="shilp-form__delete">
    <slot :context="context" :run="run">
      <button type="button" :disabled="context.isLoading" @click="run">
        {{ label }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { DELETE_MESSAGE, DELETING_MESSAGE } from '@shared/constants/messages'
import { computed, inject } from 'vue'

defineOptions({
  name: 'FormDelete',
})

const context = inject<FormContext>('shilp-form')!

function run() {
  return context.runOperation('delete')
}

const label = computed(() => {
  if (context.isDeleting) {
    return DELETING_MESSAGE
  }
  return DELETE_MESSAGE
})
</script>
