<template>
  <div v-if="context.isUpdateMode" class="shilp-form__update">
    <slot :context="context" :run="run">
      <button type="button" :disabled="context.isLoading" @click="run">
        {{ label }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { LOADING_MESSAGE, UPDATE_MESSAGE, UPDATING_MESSAGE } from '@shared/constants/messages'
import { computed, inject } from 'vue'

defineOptions({
  name: 'FormUpdate',
})

const context = inject<FormContext>('shilp-form')!

function run() {
  return context.runOperation('update')
}

const label = computed(() => {
  if (context.isUpdating) {
    return UPDATING_MESSAGE
  }
  if (context.isReading) {
    return LOADING_MESSAGE
  }
  return UPDATE_MESSAGE
})
</script>
