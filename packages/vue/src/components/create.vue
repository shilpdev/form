<template>
  <div v-if="context.isCreateMode" class="shilp-form__create">
    <slot :context="context" :run="run">
      <button type="button" :disabled="context.isLoading" @click="run">
        {{ label }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { CREATE_MESSAGE, CREATING_MESSAGE } from '@shared/constants/messages'
import { computed, inject } from 'vue'

defineOptions({
  name: 'FormCreate',
})

const context = inject<FormContext>('shilp-form')!

function run() {
  return context.runOperation('create')
}

const label = computed(() => {
  if (context.isCreating) {
    return CREATING_MESSAGE
  }
  return CREATE_MESSAGE
})
</script>
