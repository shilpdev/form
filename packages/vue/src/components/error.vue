<template>
  <div v-if="context.error" class="shilp-form__error">
    <slot :context="context">
      <pre>{{ getErrorMessage(context.error) }}</pre>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { getErrorMessage } from '@shared/messages'
import { useFormContext } from '../composables/use-form-context'

/** The error of the last action, shown only when there is one. */
defineOptions({
  name: 'FormError',
})

const context = useFormContext()
</script>
