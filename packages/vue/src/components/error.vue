<template>
  <div v-if="context.error" class="shilp-form__error">
    <slot :context="context">
      <pre>{{ getErrorMessage(context.error) }}</pre>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { getErrorMessage } from '@shared/constants/messages'
import { inject } from 'vue'

defineOptions({
  name: 'FormError',
})

const context = inject<FormContext>('shilp-form')!
</script>
