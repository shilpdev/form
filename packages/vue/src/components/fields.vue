<template>
  <div class="shilp-form__fields">
    <slot :context="context">
      <FormField v-for="field in context.fields" :key="field.name" :name="field.name" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import FormField from './field.vue'
import { inject } from 'vue'

defineOptions({
  name: 'FormFields',
})

const context = inject<FormContext>('shilp-form')!
</script>
