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
import { LOADING_MESSAGE, UPDATE_MESSAGE, UPDATING_MESSAGE } from '@shared/messages'
import { computed } from 'vue'
import { useFormContext } from '../composables/use-form-context'

defineOptions({
  name: 'FormUpdate',
})

const context = useFormContext()

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
