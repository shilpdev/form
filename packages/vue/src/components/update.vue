<template>
  <div v-if="context.isUpdateMode" class="shilp-form__update">
    <slot :context="context">
      <button type="button" :disabled="context.isLoading" @click="context.updateItem()">
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
