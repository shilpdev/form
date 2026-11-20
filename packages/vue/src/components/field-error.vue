<template>
  <div v-if="error" class="shilp-form__field-error">
    <slot :context="context" :error="error">{{ error }}</slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { computed, inject, type ComputedRef } from 'vue'
import type { VueFieldScope } from '../types'

defineOptions({
  name: 'FormFieldError',
})

// `name` shows that field's error instead of the surrounding `FormField`'s.
const { name } = defineProps<{ name?: string }>()

const context = inject<FormContext>('shilp-form')!
const fieldScope = inject<ComputedRef<VueFieldScope> | undefined>('shilp-form-field', undefined)

const error = computed(() => {
  if (name) {
    return context.fieldErrors[name]
  }
  return fieldScope!.value.error
})
</script>
