<template>
  <div class="shilp-form__fields">
    <slot :context="context">
      <FormField v-for="field in context.fields" :key="field.name" :name="field.name" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useFormContext } from '../composables/use-form-context'
import FormField from './field.vue'

defineOptions({
  name: 'FormFields',
})

const context = useFormContext()
</script>
