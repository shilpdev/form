<template>
  <div v-if="context.isCreateMode" class="shilp-form__create">
    <slot :context="context">
      <button type="button" :disabled="context.isLoading" @click="context.createItem()">
        {{ label }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { CREATE_MESSAGE, CREATING_MESSAGE } from '@shared/messages'
import { computed } from 'vue'
import { useFormContext } from '../composables/use-form-context'

defineOptions({
  name: 'FormCreate',
})

const context = useFormContext()

const label = computed(() => {
  if (context.isCreating) {
    return CREATING_MESSAGE
  }
  return CREATE_MESSAGE
})
</script>
