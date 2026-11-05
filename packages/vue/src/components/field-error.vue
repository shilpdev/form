<template>
  <div v-if="error" :class="`${CLASS_PREFIX}__field-error`">
    <slot :context="context" :error="error">{{ error }}</slot>
  </div>
</template>

<script setup lang="ts">
import { CLASS_PREFIX } from '@shared/constants'
import { computed } from 'vue'
import { useFormContext } from '../composables/use-form-context'

/** The error message of one field, shown only when there is one. */
defineOptions({
  name: 'FormFieldError',
})

const { name } = defineProps<{ name: string }>()

const context = useFormContext()

const error = computed(() => {
  return context.fieldErrors[name]
})
</script>
