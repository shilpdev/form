<template>
  <div v-if="context.isUpdateMode && !context.isReading" class="shilp-form__delete">
    <slot :context="context">
      <button type="button" :disabled="context.isLoading" @click="context.deleteItem()">
        {{ label }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { DELETE_MESSAGE, DELETING_MESSAGE, LOADING_MESSAGE } from '@shared/messages'
import { computed } from 'vue'
import { useFormContext } from '../composables/use-form-context'

defineOptions({
  name: 'FormDelete',
})

const context = useFormContext()

const label = computed(() => {
  if (context.isDeleting) {
    return DELETING_MESSAGE
  }
  if (context.isReading) {
    return LOADING_MESSAGE
  }
  return DELETE_MESSAGE
})
</script>
